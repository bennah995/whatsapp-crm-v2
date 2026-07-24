const pool = require("../db/pool");

async function list({ limit, offset, q, status }) {
  const params = [];
  const conditions = [];

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit, offset);

  const sql = `
    SELECT * FROM leads
    ${where}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const { rows } = await pool.query(sql, params);
  return rows;
}

async function count({ q, status }) {
  const params = [];
  const conditions = [];

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT COUNT(*)::int AS total FROM leads ${where}`;

  const { rows } = await pool.query(sql, params);
  return rows[0]?.total || 0;
}

async function findById(id) {
  const sql = `SELECT * FROM leads WHERE id = $1`;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
}

async function findMessagesByLeadId(leadId) {
  const sql = `SELECT * FROM messages WHERE lead_id = $1 ORDER BY created_at ASC`;
  const { rows } = await pool.query(sql, [leadId]);
  return rows;
}

async function update(id, { status, notes }) {
  const sql = `
    UPDATE leads 
    SET 
      status = COALESCE($1, status), 
      notes = COALESCE($2, notes), 
      updated_at = NOW() 
    WHERE id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [status, notes, id]);
  return rows[0] || null;
}

async function getRawStatusCounts() {
  const sql = `SELECT status, COUNT(*)::int AS count FROM leads GROUP BY status`;
  const { rows } = await pool.query(sql);
  return rows;
}

module.exports = {
  list,
  count,
  findById,
  findMessagesByLeadId,
  update,
  getRawStatusCounts
};
