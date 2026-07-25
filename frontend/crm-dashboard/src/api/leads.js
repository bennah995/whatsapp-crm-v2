import { apiRequest } from "./client";

export function fetchLeads(token, { q, status, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (limit) params.set("limit", limit);
  if (offset) params.set("offset", offset);

  const query = params.toString();
  return apiRequest(`/api/leads${query ? `?${query}` : ""}`, { token });
}

export function fetchLead(token, id) {
  return apiRequest(`/api/leads/${id}`, { token });
}

export function updateLead(token, id, updates) {
  return apiRequest(`/api/leads/${id}`, { method: "PATCH", token, body: updates });
}

export function fetchStats(token) {
  return apiRequest("/api/stats", { token });
}

export function claimLead(token, id) {
  return apiRequest(`/api/leads/${id}/claim`, { method: "PATCH", token });
}