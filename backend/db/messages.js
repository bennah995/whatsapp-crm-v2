const { dbRun } = require("./helpers");
const crypto = require("crypto");

async function logMessage(leadId, direction, body) {
  const id = crypto.randomUUID();

  await dbRun( 
    "INSERT INTO messages (id, lead_id, direction, body) VALUES (?, ?, ?, ?)",
    [id, leadId, direction, body] 
  )
}

module.exports = { logMessage };