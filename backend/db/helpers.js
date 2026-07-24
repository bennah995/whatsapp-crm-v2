const pool = require("./pool");

function toPgQuery(query) {
  let i = 0;
  return query.replace(/\?/g, () => `$${++i}`);
}

async function dbGet(query, params = []) {
  const { rows } = await pool.query(toPgQuery(query), params);
  return rows[0] ?? null;
}

async function dbAll(query, params = []) {
  const { rows } = await pool.query(toPgQuery(query), params);
  return rows;
}

async function dbRun(query, params = []) {
  return pool.query(toPgQuery(query), params);
}

module.exports = { dbGet, dbAll, dbRun };
