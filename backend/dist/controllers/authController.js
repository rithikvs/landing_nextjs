"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const oracledb_1 = __importDefault(require("oracledb"));
const db_1 = require("../config/db");
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const signup = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Missing fields' });
    try {
        const check = await (0, db_1.execute)(`SELECT id FROM users WHERE username = :1`, [username]);
        if (check.rows && check.rows.length > 0)
            return res.status(409).json({ message: 'User exists' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const id = crypto_1.default.randomUUID();
        await (0, db_1.execute)(`INSERT INTO users (id, username, password_hash) VALUES (:1, :2, :3)`, [id, username, hashedPassword]);
        res.status(201).json({ message: 'User created' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await (0, db_1.execute)(`SELECT id, password_hash FROM users WHERE username = :1`, [username], { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
        const users = result.rows;
        if (!users || users.length === 0)
            return res.status(401).json({ message: 'Invalid credentials' });
        const user = users[0];
        const hash = user.PASSWORD_HASH || user.password_hash;
        const isMatch = await bcryptjs_1.default.compare(password, hash);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.ID || user.id, username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
