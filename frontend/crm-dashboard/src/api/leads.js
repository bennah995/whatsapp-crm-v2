const API_URL = import.meta.env.VITE_API_URL;

export async function fetchLeads({ limit = 10, offset = 0, q = "", status = "" }) {
  const params = new URLSearchParams({ limit, offset, q, status });
  const res = await fetch(`${API_URL}/api/leads?${params}`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function fetchLeadById(id) {
  const res = await fetch(`${API_URL}/api/leads/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lead");
  return res.json();
}

export async function updateLead(id, fields) {
  const res = await fetch(`${API_URL}/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_URL}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}