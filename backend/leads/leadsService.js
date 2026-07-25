const leadsRepo = require("../repositories/leadsRepo");

async function getLeadsList({ limit = 10, offset = 0, q = null, status = null }, user) {
  let parsedLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const parsedOffset = parseInt(offset, 10) || 0;

  const filters = { limit: parsedLimit, offset: parsedOffset, q, status};
  if(user.role !== "admin"){
    filters.assignedTo = user.id;
  }

  // Run data fetch and total item counting concurrently
  const [rows, total] = await Promise.all([
    leadsRepo.list(filters),
    leadsRepo.count(filters)
    // leadsRepo.list({ limit: parsedLimit, offset: parsedOffset, q, status }),
    // leadsRepo.count({ q, status })
  ]);

  return {
    data: rows,
    total,
    limit: parsedLimit,
    offset: parsedOffset
  };
}

async function getLeadDetail(id, user) {
  const lead = await leadsRepo.findById(id);
  if (!lead) return null;

  const belongsToSomeoneElse = lead.assignedTo && lead.assignedTo !== user.id; 
  if(user.role !== "admin" && belongsToSomeoneElse){
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  const messages = await leadsRepo.findMessagesByLeadId(id);
  return { ...lead, messages };
}

async function claimLead(id, user) {
  const claimed = await leadsRepo.claim(id, user.id);
  if (claimed) return claimed;

  const lead = await leadsRepo.findById(id);
  if (!lead) {
    const err = new Error("Lead not found");
    err.statusCode = 404;
    throw err;
  }

  const err = new Error("Lead already claimed");
  err.statusCode = 409;
  throw err;
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
  claimLead,
  getStatsSummary
};
