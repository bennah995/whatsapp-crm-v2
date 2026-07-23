require('dotenv').config();
const sqlite3 = require('sqlite3');
const { Pool } = require('pg');
const path = require('path');

// 1. Initialize Connections
const sqliteDb = new sqlite3.Database(path.join(__dirname, '..', 'db', 'crm.db'));

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://crm_app:crm_dev_password@localhost:5432/crm_app"
});

// Helper wrapper to fetch all rows sequentially from SQLite
const sqliteAll = (query) => new Promise((res, rej) => sqliteDb.all(query, [], (err, rows) => err ? rej(err) : res(rows)));

async function runMigration() {
  console.log("🚀 Starting data migration from SQLite to PostgreSQL...");
  const pgClient = await pgPool.connect();

  try {
    // Wrap entire migration in a transaction for safety
    await pgClient.query('BEGIN');

    // --- STEP 1: MIGRATE LEADS ---
    console.log("📦 Fetching leads from SQLite...");
    const sqliteLeads = await sqliteAll("SELECT * FROM leads");
    console.log(`Found ${sqliteLeads.length} leads.`);

    for (const lead of sqliteLeads) {
      // Enforce PostgreSQL strict ENUM check fallback
      const validStatuses = ['new', 'contacted', 'qualified', 'closed'];
      const status = validStatuses.includes(lead.status) ? lead.status : 'new';

      await pgClient.query(`
        INSERT INTO leads (id, wa_phone, name, email, inquiry_type, status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (wa_phone) DO NOTHING;
      `, [
        lead.id, lead.wa_phone, lead.name, lead.email, 
        lead.inquiry_type, status, lead.notes, lead.created_at, lead.updated_at
      ]);
    }
    console.log("✅ Leads migrated successfully.");

    // --- STEP 2: MIGRATE CONVERSATIONS ---
    console.log("📦 Fetching conversations from SQLite...");
    const sqliteConversations = await sqliteAll("SELECT * FROM conversations");
    console.log(`Found ${sqliteConversations.length} conversations.`);

    for (const conv of sqliteConversations) {
      // Parse SQLite TEXT into PostgreSQL native JSONB object
      let parsedData = {};
      try {
        parsedData = conv.data ? JSON.parse(conv.data) : {};
      } catch (e) {
        console.warn(`⚠️ Failed to parse JSON data for conversation ${conv.id}, defaulting to empty object.`);
      }

      await pgClient.query(`
        INSERT INTO conversations (id, lead_id, state, data, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING;
      `, [conv.id, conv.lead_id, conv.state, JSON.stringify(parsedData), conv.updated_at]);
    }
    console.log("✅ Conversations migrated successfully.");

    // --- STEP 3: MIGRATE MESSAGES ---
    console.log("📦 Fetching messages from SQLite...");
    const sqliteMessages = await sqliteAll("SELECT * FROM messages");
    console.log(`Found ${sqliteMessages.length} messages.`);

    for (const msg of sqliteMessages) {
      // Map SQLite custom directions to your new PostgreSQL CHECK constraints ('in' or 'out')
      let direction = 'in';
      if (msg.direction === 'outbound' || msg.direction === 'out') {
        direction = 'out';
      }

      await pgClient.query(`
        INSERT INTO messages (id, lead_id, direction, body, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING;
      `, [msg.id, msg.lead_id, direction, msg.body, msg.created_at]);
    }
    console.log("✅ Messages migrated successfully.");

    // Commit changes if everything passed without a hitch
    await pgClient.query('COMMIT');
    console.log("🎉 Migration finished cleanly. All data is synchronized!");

  } catch (error) {
    // Automatically roll back the whole database state if a crash happens mid-flight
    await pgClient.query('ROLLBACK');
    console.error("❌ Migration failed completely. Transaction rolled back safely.", error);
  } finally {
    pgClient.release();
    sqliteDb.close();
    await pgPool.end();
  }
}

runMigration();
