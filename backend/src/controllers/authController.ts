import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import oracledb from 'oracledb';
import { execute } from '../config/db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const signup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    try {
        const check = await execute(`SELECT ID FROM users WHERE EMAIL = :1`, [email]);
        if (check.rows && check.rows.length > 0) return res.status(409).json({ message: 'User exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await execute(
            `INSERT INTO users (NAME, EMAIL, PASSWORD_HASH) VALUES (:1, :2, :3)`,
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User created' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await execute(
            `SELECT ID, NAME, EMAIL, PASSWORD_HASH FROM users WHERE EMAIL = :1`,
            [email],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const users = result.rows as any[];
        if (!users || users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = users[0];
        const hash = user.PASSWORD_HASH || user.password_hash;

        const isMatch = await bcrypt.compare(password, hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.ID || user.id, email: user.EMAIL || user.email, name: user.NAME || user.name }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, email: user.EMAIL || user.email, name: user.NAME || user.name });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
