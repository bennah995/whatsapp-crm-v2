const { dbGet, dbRun } = require("./helpers");
const crypto = require("crypto");

async function getConversation(leadId) {
  // look up a row in `conversations` where lead_id = leadId
  // return it (or null/undefined if none exists yet)

  const existing = await dbGet(
    "SELECT * FROM conversations WHERE lead_id = ?",
    [leadId]
  )

  if(existing) return existing;
  if(!existing) return null;
}

async function saveConversation(leadId, state, data) {
  // data is an object — remember it needs JSON.stringify before storing,
  // since the column is TEXT
  const conversation = await getConversation(leadId);

  // you need to know: does a conversation row already exist for this lead?
  // if yes -> UPDATE state, data, updated_at
  // if no  -> INSERT a new row with a fresh id
  if(conversation){
    await dbRun(
      "UPDATE conversations SET state = ?, data = ?, updated_at = datetime('now') WHERE lead_id = ?",
      [state, JSON.stringify(data), leadId]
    )
  } else{  
    const id = crypto.randomUUID();
    
    await dbRun(
      "INSERT INTO conversations (id, lead_id, state, data) VALUES (?, ?, ?, ?)",
      [id, leadId, state, JSON.stringify(data)]
    )
  }
}

module.exports = { getConversation, saveConversation };