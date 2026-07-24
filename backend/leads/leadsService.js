const leadsRepo = require("../repositories/leadsRepo");

async function getLeadsList({ limit = 10, offset = 0, q = null, status = null }) {
  let parsedLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const parsedOffset = parseInt(offset, 10) || 0;

  // Run data fetch and total item counting concurrently
  const [rows, total] = await Promise.all([
    leadsRepo.list({ limit: parsedLimit, offset: parsedOffset, q, status }),
    leadsRepo.count({ q, status })
  ]);

  return {
    data: rows,
    total,
    limit: parsedLimit,
    offset: parsedOffset
  };
}

async function getLeadDetail(id) {
  const lead = await leadsRepo.findById(id);
  if (!lead) return null;

  const messages = await leadsRepo.findMessagesByLeadId(id);
  return { ...lead, messages };
}

async function updateLead(id, { status, notes }) {
  return await leadsRepo.update(id, {
    status: status || null,
    notes: notes || null
  });
}

async function getStatsSummary() {
  const rows = await leadsRepo.getRawStatusCounts();
  const stats = {};
  rows.forEach((r) => {
    stats[r.status] = r.count;
  });
  return stats;
}

module.exports = {
  getLeadsList,
  getLeadDetail,
  updateLead,
  getStatsSummary
};
