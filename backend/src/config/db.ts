import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: process.env.ORACLE_USER || "system",
    password: process.env.ORACLE_PASSWORD || "2111",
    connectString: process.env.ORACLE_CONN_STR || "localhost:1521/xe",
};

try {
    // ...existing code...
    oracledb.initOracleClient();
} catch (err) {
    // ...existing code...
}

export async function getConnection() {
    return await oracledb.getConnection(dbConfig);
}

export async function execute(sql: string, binds: any = [], options: oracledb.ExecuteOptions = {}) {
    let connection;
    try {
        connection = await getConnection();
        if (options.autoCommit === undefined) options.autoCommit = true;
        return await connection.execute(sql, binds, options);
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { }
        }
    }
}
