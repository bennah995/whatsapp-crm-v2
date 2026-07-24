const express = require("express");
const router = express.Router();
const leadsService = require("../leads/leadsService");

// GET /api/leads
router.get("/leads", async (req, res) => {
  try {
    const { limit, offset, q, status } = req.query;
    
    const result = await leadsService.getLeadsList({ limit, offset, q, status });
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// GET /api/leads/:id
router.get("/leads/:id", async (req, res) => {
  try {
    const result = await leadsService.getLeadDetail(req.params.id);
    if (!result) return res.status(404).json({ error: "Lead not found" });

    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// PATCH /api/leads/:id
router.patch("/leads/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await leadsService.updateLead(req.params.id, { status, notes });
    if (!updated) return res.status(404).json({ error: "Lead not found" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// GET /api/stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await leadsService.getStatsSummary();
    return res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const { dbGet, dbAll, dbRun } = require("../db/helpers");

// // GET /api/leads?limit=10&offset=0&q=&status=
// router.get("/leads", async (req, res) => {
//   try {
//     let limit = parseInt(req.query.limit) || 10;
//     limit = Math.min(limit, 100);
//     const offset = parseInt(req.query.offset) || 0;
//     const q = req.query.q ? `%${req.query.q}%` : null;
//     const status = req.query.status || null;

//     let where = [];
//     let params = [];

//     if (q) {
//       where.push("(name ILIKE ? OR email ILIKE ?)");
//       params.push(q, q);
//     }
//     if (status) {
//       where.push("status = ?");
//       params.push(status);
//     }

//     const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

//     const rows = await dbAll(
//       `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
//       [...params, limit, offset]
//     );

//     const countRow = await dbGet(
//       `SELECT COUNT(*)::int AS total FROM leads ${whereClause}`,
//       params
//     );

//     res.json({ data: rows, total: countRow.total, limit, offset });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch leads" });
//   }
// });

// // GET /api/leads/:id
// router.get("/leads/:id", async (req, res) => {
//   try {
//     const lead = await dbGet("SELECT * FROM leads WHERE id = ?", [req.params.id]);
//     if (!lead) return res.status(404).json({ error: "Lead not found" });

//     const messages = await dbAll(
//       "SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC",
//       [req.params.id]
//     );

//     res.json({ ...lead, messages });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch lead" });
//   }
// });

// // PATCH /api/leads/:id
// router.patch("/leads/:id", async (req, res) => {
//   try {
//     const { status, notes } = req.body;
//     const lead = await dbGet("SELECT * FROM leads WHERE id = ?", [req.params.id]);
//     if (!lead) return res.status(404).json({ error: "Lead not found" });

//     await dbRun(
//       "UPDATE leads SET status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = NOW() WHERE id = ?",
//       [status || null, notes || null, req.params.id]
//     );

//     const updated = await dbGet("SELECT * FROM leads WHERE id = ?", [req.params.id]);
//     res.json(updated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update lead" });
//   }
// });

// // GET /api/stats
// router.get("/stats", async (req, res) => {
//   try {
//     const rows = await dbAll(
//       "SELECT status, COUNT(*)::int AS count FROM leads GROUP BY status",
//       []
//     );
//     const stats = {};
//     rows.forEach((r) => (stats[r.status] = r.count));
//     res.json(stats);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch stats" });
//   }
// });

// module.exports = router;
