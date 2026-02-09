import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: process.env.ORACLE_USER || "system",
    password: process.env.ORACLE_PASSWORD || "2111",
    connectString: process.env.ORACLE_CONN_STR || "localhost:1521/xe",
};

try {
    // Oracle 10g requires thick mode (Instant Client must be installed)
    oracledb.initOracleClient();
} catch (err) {
    console.log("Oracle Client already initialized or not found.");
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
