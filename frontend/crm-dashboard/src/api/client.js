const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const error = new Error(errBody.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}
