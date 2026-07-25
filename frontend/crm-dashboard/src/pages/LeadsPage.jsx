import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { fetchLeads } from "../api/leads";
import { claimLead } from "../api/leads";
import { useState } from "react";

const STATUSES = ["new", "contacted", "qualified", "closed"];
const PAGE_SIZE = 10;

export default function LeadsPage() {
  const { token, user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [claimingId, setClaimingId] = useState(null);
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  const { data, loading, error, refetch } = useFetch(
    () => fetchLeads(token, { q, status, limit: PAGE_SIZE, offset }),
    [token, q, status, page]
  );

  async function handleClaim(e, leadId) {
    e.stopPropagation(); // don't trigger the row's navigate-to-detail click
    setClaimingId(leadId);
    try {
      await claimLead(token, leadId);
      refetch(); // useFetch needs to expose this — see note below
    } catch (err) {
      alert(err.message); // swap for a nicer inline error if you prefer
    } finally {
      setClaimingId(null);
    }
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  function goToPage(newPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Leads</h1>
        <button className="btn-secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Search name or email"
          value={q}
          onChange={(e) => updateParam("q", e.target.value)}
        />
        <select value={status} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="hint-text">Loading…</p>}
      {error && <p className="error-text">{error.message}</p>}

      {data && (
        <>
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-row">
                    No leads match these filters.
                  </td>
                </tr>
              )}
              {data.data.map((lead) => (
                <tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td>{lead.name || "—"}</td>
                  <td>{lead.email || "—"}</td>
                  <td>{lead.wa_phone}</td>
                  <td>
                    <span className={`status-badge status-${lead.status}`}>{lead.status}</span>
                  </td>
                  <td>{new Date(lead.updated_at).toLocaleDateString()}</td>
                  <td>
                    {!lead.assigned_to && user?.role !== "admin" && (
                      <button
                        className="btn-secondary"
                        disabled={claimingId === lead.id}
                        onClick={(e) => handleClaim(e, lead.id)}
                      >
                        {claimingId === lead.id ? "Claiming…" : "Claim"}
                      </button>
                    )}
                  </td>
                  <td>{lead.assigned_to_email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
