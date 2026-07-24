const pool = require('./pool');

async function verifyPool() {
  console.log("Testing connection pool via SELECT 1...");
  try {
    // Run the sanity check query
    const res = await pool.query('SELECT 1 AS test_val');
    
    // Assert the result structure is exactly what we expect
    if (res.rows[0].test_val === 1) {
      console.log("Connection verified! SELECT 1 succeeded.");
    } else {
      console.warn("Received unexpected payload shape:", res.rows);
    }
  } catch (err) {
    console.error("Pool connection test failed!");
    console.error(`Reason: ${err.message}`);
    console.error("Check that PostgreSQL is running and your .env variables match your user credentials.");
  } finally {
    // Drain the pool so the Node process can exit immediately
    await pool.end();
    console.log("Pool drained safely.");
  }
}

verifyPool();
