"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = getConnection;
exports.execute = execute;
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    user: process.env.ORACLE_USER || "system",
    password: process.env.ORACLE_PASSWORD || "password",
    connectString: process.env.ORACLE_CONN_STR || "localhost:1521/xe",
};
try {
    // Oracle 10g requires thick mode (Instant Client must be installed)
    oracledb_1.default.initOracleClient();
}
catch (err) {
    console.log("Oracle Client already initialized or not found.");
}
async function getConnection() {
    return await oracledb_1.default.getConnection(dbConfig);
}
async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await getConnection();
        if (options.autoCommit === undefined)
            options.autoCommit = true;
        return await connection.execute(sql, binds, options);
    }
    finally {
        if (connection) {
            try {
                await connection.close();
            }
            catch (e) { }
        }
    }
}
