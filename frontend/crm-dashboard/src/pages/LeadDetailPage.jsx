import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { fetchLead, updateLead } from "../api/leads";
import { claimLead } from "../api/leads";

const STATUSES = ["new", "contacted", "qualified", "closed"];

export default function LeadDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const { data: lead, loading, error, refetch } = useFetch(
    () => fetchLead(token, id),
    [token, id]
  );

  const [notes, setNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    if (lead) setNotes(lead.notes || "");
  }, [lead]);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setSavingStatus(true);
    setActionError(null);
    try {
      await updateLead(token, id, { status: newStatus });
      refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleNotesBlur() {
    if (!lead || notes === (lead.notes || "")) return;
    setSavingNotes(true);
    setActionError(null);
    try {
      await updateLead(token, id, { notes });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingNotes(false);
    }
  }

  if (loading) return <p className="hint-text">Loading…</p>;
  if (error) {
    return (
      <div className="page">
        <Link to="/">← Back to leads</Link>
        <p className="error-text">
          {error.status === 403 ? "You don't have access to this lead." : error.message}
        </p>
      </div>
    );
  }
  if (!lead) return <p className="hint-text">Lead not found.</p>;

  return (
    <div className="page">
      <Link to="/">← Back to leads</Link>
      <h1>{lead.name || "Unnamed lead"}</h1>
      {actionError && <p className="error-text">{actionError}</p>}

      <dl className="lead-info">
        <dt>Phone</dt>
        <dd>{lead.wa_phone}</dd>
        <dt>Email</dt>
        <dd>{lead.email || "—"}</dd>
        <dt>Inquiry type</dt>
        <dd>{lead.inquiry_type || "—"}</dd>
        <dt>Status</dt>
        <dd>
          <select value={lead.status} onChange={handleStatusChange} disabled={savingStatus}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {savingStatus && <span className="hint-text"> Saving…</span>}
        </dd>
        <dt>Assigned to</dt>
        <dd>{lead.assigned_to_email || "Unassigned"}</dd>
      </dl>

      {!lead.assigned_to && (
        <button onClick={async () => { await claimLead(token, id); refetch(); }}>
          Claim this lead
        </button>
      )}

      <section>
        <h2>Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          rows={4}
          placeholder="Add notes about this lead…"
        />
        {savingNotes && <span className="hint-text"> Saving…</span>}
      </section>

      <section>
        <h2>Conversation</h2>
        <ul className="messages">
          {(lead.messages || []).length === 0 && (
            <li className="hint-text">No messages yet.</li>
          )}
          {(lead.messages || []).map((m) => (
            <li key={m.id} className={`message message-${m.direction}`}>
              <span className="message-direction">{m.direction === "in" ? "Lead" : "Us"}</span>
              <span className="message-body">{m.body}</span>
              <span className="message-time">{new Date(m.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
