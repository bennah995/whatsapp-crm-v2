require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./pool");

async function initSchema() {
  const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf8"
  );

  await pool.query(schema);
  console.log("Schema loaded successfully");
}

module.exports = { pool, initSchema };