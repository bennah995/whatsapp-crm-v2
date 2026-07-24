// packages/backend/db/testConnection.js
require("dotenv").config();
const pool = require("./pool");

(async () => {
  try {
    const { rows } = await pool.query("SELECT 1 AS ok");
    console.log("DB connection OK:", rows[0]);
  } catch (err) {
    console.error("DB connection failed:", err.message);
  } finally {
    await pool.end();
  }
})();