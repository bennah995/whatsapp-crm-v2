const sqlite3 = require("sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "crm.db")
const db = new sqlite3.Database(path.join(dbPath));

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

db.exec(schema, (err) => {
  if (err) {
    console.error("Schema init failed:", err);
  } else {
    console.log("Schema loaded successfully");
  }
});

// db.get("SELECT * FROM leads WHERE wa_phone = ?", [phone], (err, row) => {
  
// });

module.exports = db;