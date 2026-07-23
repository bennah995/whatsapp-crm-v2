import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLeadById, updateLead } from "../api/leads";
import { useFetch } from "../hooks/useFetch";

const STATUSES = ["new", "contacted", "qualified", "closed"];

const STATUS_STYLES = {
  new: "bg-[#F5EAD3] text-[#B07F2E]",
  contacted: "bg-[#E4EEF1] text-[#2E5D68]",
  qualified: "bg-[#E4EDE7] text-[#1E4A3E]",
  closed: "bg-[#ECEAE3] text-[#79705F]",
};

function Field({ label, value }) {
  return (
    <div className="border-b border-[#E4DECF] px-5 py-4 last:border-b-0">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
        {label}
      </div>

      <div className="mt-1 text-sm text-[#2A2721] whitespace-pre-wrap">
        {value || "—"}
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(() => fetchLeadById(id), [id]);

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (data) {
      setLead(data);
      setNotes(data.notes || "");
    }
  }, [data]);

  async function handleStatusChange(status) {
    const previous = lead;

    setLead({
      ...lead,
      status,
    });

    setSaving(true);
    setSaveError("");

    try {
      const updated = await updateLead(id, { status });
      setLead({
        ...lead,
        ...updated,
      });
    } catch (err) {
      setLead(previous);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleNotesBlur() {
    if (!lead) return;

    setSaving(true);
    setSaveError("");

    try {
      const updated = await updateLead(id, {
        notes,
      });

      setLead({
        ...lead,
        ...updated,
      });
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-[#79705F]">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600">
        {error}
      </div>
    );

  if (!lead)
    return (
      <div className="p-10 text-center">
        Lead not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F6F3EC]">
      <header className="sticky top-0 z-20 border-b border-[#E4DECF] bg-[#F6F3EC] px-8 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-md border border-[#E4DECF] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#F9F7F2]"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold">
            Lead Details
          </h1>

          {saving && (
            <span className="ml-auto text-sm text-[#79705F]">
              Saving...
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-8 py-8">

        <div className="rounded-xl border border-[#E4DECF] bg-white p-6">
          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                {lead.name || "Unnamed Lead"}
              </h2>

              <p className="mt-1 text-[#79705F]">
                {lead.wa_phone}
              </p>
            </div>

            <select
              value={lead.status}
              disabled={saving}
              onChange={(e) =>
                handleStatusChange(e.target.value)
              }
              className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${STATUS_STYLES[lead.status]}`}
            >
              {STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {saveError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
            {saveError}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[#E4DECF] bg-white">
          <Field
            label="Email"
            value={lead.email}
          />

          <Field
            label="Phone"
            value={lead.wa_phone}
          />

          <Field
            label="Inquiry"
            value={lead.inquiry_type}
          />

          <Field
            label="Status"
            value={lead.status}
          />

          <Field
            label="Created"
            value={
              lead.created_at
                ? new Date(
                    lead.created_at
                  ).toLocaleString()
                : ""
            }
          />
        </div>

        <div className="rounded-xl border border-[#E4DECF] bg-white p-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
            Notes
          </label>

          <textarea
            rows={6}
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            onBlur={handleNotesBlur}
            placeholder="Write notes about this lead..."
            className="w-full rounded-lg border border-[#E4DECF] p-3 outline-none focus:ring-2 focus:ring-[#E4EDE7]"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E4DECF] bg-white">
          <div className="border-b border-[#E4DECF] px-5 py-4">
            <h2 className="font-semibold">
              Conversation History
            </h2>
          </div>

          {lead.messages?.length ? (
            lead.messages.map((message) => (
              <div
                key={message.id}
                className="border-b border-[#E4DECF] px-5 py-4 last:border-none"
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold capitalize">
                    {message.direction}
                  </span>

                  <span className="text-[#79705F]">
                    {message.created_at
                      ? new Date(
                          message.created_at
                        ).toLocaleString()
                      : ""}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm">
                  {message.body}
                </p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-[#79705F]">
              No conversation history yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}