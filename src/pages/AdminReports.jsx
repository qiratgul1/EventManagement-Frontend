import { useState } from "react";
import api, { errMsg } from "../api";
import { ExpoSelect, Field, Msg, useLoad } from "../ui";

export default function AdminReports() {
  const [expoId, setExpoId] = useState("");
  const [type, setType] = useState("booths");
  const [err, setErr] = useState("");
  const { data, error } = useLoad(async () => (expoId ? (await api.get(`/api/reports/${expoId}`, { params: { type } })).data : null), [expoId, type]);

  const download = async () => {
    try {
      const res = await api.get(`/api/reports/${expoId}`, { params: { type, format: "csv" }, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href = url; a.download = `${type}-report.csv`; a.click(); URL.revokeObjectURL(url);
    } catch (e) { setErr(errMsg(e)); }
  };
  const cols = data?.rows?.length ? Object.keys(data.rows[0]) : [];

  return (
    <>
      <h1>Reports</h1>
      <div className="row">
        <div className="grow"><ExpoSelect value={expoId} onChange={setExpoId} /></div>
        <div className="grow">
          <Field label="Report" as="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="booths">Booths &amp; traffic</option><option value="attendees">Registered attendees</option>
            <option value="sessions">Session popularity</option><option value="applications">Exhibitor applications</option>
          </Field>
        </div>
        <button className="btn amber" onClick={download} disabled={!expoId}>Download CSV</button>
      </div>
      <Msg error={error || err} />
      <div className="card scroll">
        {data && !data.rows.length && <p className="muted">No data for this report yet.</p>}
        {cols.length > 0 && (
          <table>
            <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{data.rows.map((r, i) => <tr key={i}>{cols.map((c) => <td key={c}>{String(r[c])}</td>)}</tr>)}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
