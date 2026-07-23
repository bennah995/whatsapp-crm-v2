const { dbGet, dbRun } = require("./helpers");
const crypto = require("crypto");

async function findOrCreateLead(phone) {
  // try to find an existing lead by phone
  const existing = await dbGet(
    "SELECT * FROM leads WHERE wa_phone = ?",
    [phone]
  )
  if(existing){
    return existing;
  }
  // if not found, generate a UUID, INSERT a new lead, then return

  const id = crypto.randomUUID();

  await dbRun(
    "INSERT INTO leads (id, wa_phone, status) VALUES (?, ?, 'new')",
    [id, phone]
  )
  
  return { id, wa_phone: phone, status: "new"};
}

async function updateLead(id, fields) {
  // fields is an object like { name: "John" } or { email: "john@x.com", status: "qualified" }
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const params = keys.map((key) => fields[key]);

  await dbRun(
    `UPDATE leads SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
    [...params, id]
  );
}

module.exports = { findOrCreateLead, updateLead };