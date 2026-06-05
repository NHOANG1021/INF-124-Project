require("dotenv").config();

const sql = require("mssql/msnodesqlv8");

const config = {
  connectionString:
    `Driver={ODBC Driver 17 for SQL Server};` +
    `Server=${process.env.DB_SERVER};` +
    `Database=${process.env.DB_DATABASE};` +
    `Trusted_Connection=Yes;` +
    `TrustServerCertificate=Yes;`,
};

async function connectDB() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

module.exports = {
  sql,
  connectDB,
};