import { useState } from "react";
import api, { errMsg } from "../api";
import { ExpoSelect, Field, Msg, statusChip, useLoad } from "../ui";

export default function AdminApplications() {
  const [expoId, setExpoId] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState({});
  const [m, setM] = useState({});
  const { data, error, reload } = useLoad(
    async () => (expoId ? (await api.get("/api/applications", { params: { expoId, status: status || undefined } })).data.applications : []),
    [expoId, status]
  );

  const review = async (a, s) => {
    try { await api.put(`/api/applications/${a._id}/status`, { status: s, adminNote: notes[a._id] }); setM({ ok: `Application ${s}` }); reload(); }
    catch (e) { setM({ error: errMsg(e) }); }
  };

  return (
    <>
      <h1>Exhibitor applications</h1>
      <div className="row">
        <div className="grow"><ExpoSelect value={expoId} onChange={setExpoId} /></div>
        <div className="grow">
          <Field label="Status" as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </Field>
        </div>
      </div>
      <Msg error={error} {...m} />
      <div className="card scroll">
        <table>
          <thead><tr><th>Company</th><th>Exhibitor</th><th>Category / products</th><th>Documents</th><th>Status</th><th>Review</th></tr></thead>
          <tbody>
            {data?.map((a) => (
              <tr key={a._id}>
                <td><b>{a.companyName}</b><div className="muted">{a.description}</div></td>
                <td>{a.exhibitorId?.name}<div className="muted">{a.exhibitorId?.email}</div></td>
                <td>{a.category}<div className="muted">{a.products?.join(", ")}</div></td>
                <td>{a.documents?.map((d, i) => <div key={i}><a href={d.url} target="_blank" rel="noreferrer">{d.name}</a></div>)}</td>
                <td>{statusChip(a.status)}</td>
                <td style={{ minWidth: 220 }}>
                  <input aria-label={`Note for ${a.companyName}`} placeholder="Note (optional)" style={{ width: "100%", minHeight: 44, marginBottom: 6, padding: "0 10px" }} value={notes[a._id] || ""} onChange={(e) => setNotes({ ...notes, [a._id]: e.target.value })} />
                  <div className="row">
                    <button className="btn" onClick={() => review(a, "approved")}>Approve</button>
                    <button className="btn danger" onClick={() => review(a, "rejected")}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && !data.length && <p className="muted">No applications.</p>}
      </div>
    </>
  );
}
