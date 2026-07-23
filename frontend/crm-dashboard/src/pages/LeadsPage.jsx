import { useSearchParams, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { fetchLeads } from "../api/leads";

const LIMIT = 10;

function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const offset = parseInt(searchParams.get("offset")) || 0;

  const { data, loading, error } = useFetch(
    () => fetchLeads({ limit: LIMIT, offset, q, status }),
    [q, status, offset]
  );

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("offset", "0"); // reset pagination when filters change
    setSearchParams(next);
  }

  function goToPage(newOffset) {
    const next = new URLSearchParams(searchParams);
    next.set("offset", newOffset);
    setSearchParams(next);
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] font-sans text-[#2A2721]">
      <header className="sticky top-0 z-10 border-b border-[#E4DECF] bg-[#F6F3EC] px-8 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-bold tracking-tight">Leads Dashboard</h1>

          <div className="flex gap-2.5">
            <input
              placeholder="Search name or email..."
              value={q}
              onChange={(e) => updateParam("q", e.target.value)}
              className="w-60 rounded-lg border border-[#E4DECF] bg-white px-3 py-2 text-sm text-[#2A2721] placeholder:text-[#79705F] focus:outline-none focus:ring-2 focus:ring-[#E4EDE7] focus:border-[#1E4A3E]"
            />

            <select
              value={status}
              onChange={(e) => updateParam("status", e.target.value)}
              className="rounded-lg border border-[#E4DECF] bg-white px-2.5 py-2 text-sm text-[#2A2721] focus:outline-none focus:ring-2 focus:ring-[#E4EDE7] focus:border-[#1E4A3E]"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-7">
        {loading && <p className="text-sm text-[#79705F]">Loading...</p>}

        {error && (
          <p className="rounded-lg border border-[#A5432B]/20 bg-[#F5E4DD] px-3.5 py-3 text-sm text-[#A5432B]">
            Error: {error}
          </p>
        )}

        {!loading && !error && data?.data.length === 0 && (
          <p className="rounded-xl border border-[#E4DECF] bg-white px-6 py-16 text-center text-sm text-[#79705F]">
            No leads yet. Send a WhatsApp to your test number to get started.
          </p>
        )}

        {!loading && !error && data?.data.length > 0 && (
          <>
            <div className="overflow-hidden rounded-xl border border-[#E4DECF] bg-white">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-[#D5CDB9] bg-[#FBF9F4] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
                      Name
                    </th>
                    <th className="border-b border-[#D5CDB9] bg-[#FBF9F4] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
                      Phone
                    </th>
                    <th className="border-b border-[#D5CDB9] bg-[#FBF9F4] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
                      Email
                    </th>
                    <th className="border-b border-[#D5CDB9] bg-[#FBF9F4] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
                      Inquiry
                    </th>
                    <th className="border-b border-[#D5CDB9] bg-[#FBF9F4] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
                      Status
                    </th>
                    <th className="border-b border-[#D5CDB9] bg-[#FBF9F4] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-[#79705F]">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="cursor-pointer border-b border-[#E4DECF] last:border-b-0 hover:bg-[#E4EDE7]"
                    >
                      <td className="px-4 py-3 font-medium">{lead.name || "—"}</td>
                      <td className="px-4 py-3 text-[#79705F]">{lead.wa_phone}</td>
                      <td className="px-4 py-3 text-[#79705F]">{lead.email || "—"}</td>
                      <td className="px-4 py-3 text-[#79705F]">{lead.inquiry_type || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize " +
                            (lead.status === "new"
                              ? "bg-[#F5EAD3] text-[#B07F2E]"
                              : lead.status === "contacted"
                              ? "bg-[#E4EEF1] text-[#2E5D68]"
                              : lead.status === "qualified"
                              ? "bg-[#E4EDE7] text-[#1E4A3E]"
                              : "bg-[#ECEAE3] text-[#79705F]")
                          }
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#79705F]">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3.5">
              <span className="text-sm text-[#79705F]">
                Showing {offset + 1}–{Math.min(offset + LIMIT, data.total)} of {data.total}
              </span>
              <button
                disabled={offset === 0}
                onClick={() => goToPage(Math.max(0, offset - LIMIT))}
                className="rounded-md border border-[#E4DECF] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#2A2721] hover:bg-[#F6F3EC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={offset + LIMIT >= data.total}
                onClick={() => goToPage(offset + LIMIT)}
                className="rounded-md border border-transparent bg-[#1E4A3E] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#163A31] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default LeadsPage;