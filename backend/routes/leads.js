const express = require("express");
const router = express.Router();
const leadsService = require("../leads/leadsService");

// GET /api/leads
router.get("/leads", async (req, res) => {
  try {
    const { limit, offset, q, status } = req.query;
    
    const result = await leadsService.getLeadsList({ limit, offset, q, status }, req.user);
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// GET /api/leads/:id
router.get("/leads/:id", async (req, res) => {
  try {
    const result = await leadsService.getLeadDetail(req.params.id, req.user);
    if (!result) return res.status(404).json({ error: "Lead not found" });

    return res.json(result);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// PATCH /api/leads/:id
router.patch("/leads/:id/claim", async (req, res) => {
  try {
    const claimed = await leadsService.claimLead(req.params.id, req.user);
    return res.json(claimed);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Failed to claim lead" });
  }
});
// router.patch("/leads/:id/claim", async (req, res) => {
//   try {
//     const { status, notes } = req.body;
//     const updated = await leadsService.updateLead(req.params.id, { status, notes });
//     if (!updated) return res.status(404).json({ error: "Lead not found" });

//     return res.json(updated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update lead" });
//   }
// });

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