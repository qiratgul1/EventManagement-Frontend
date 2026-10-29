import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import { Field, Msg, list, statusChip, useLoad } from "../ui";

function BoothCard({ b, onChange }) {
  const d = b.details || {};
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({
    description: d.description || "", products: (d.products || []).join(", "),
    staff: (d.staff || []).map((s) => [s.name, s.email, s.phone].filter(Boolean).join(", ")).join("\n"),
  });
  const [neighbors, setNeighbors] = useState(null);
  const [m, setM] = useState({});

  const save = async (e) => {
    e.preventDefault();
    const staff = f.staff.split("\n").map((l) => l.split(",").map((x) => x.trim())).filter((x) => x[0]).map(([name, email, phone]) => ({ name, email, phone }));
    try { await api.put(`/api/booths/${b._id}/details`, { description: f.description, products: list(f.products), staff }); setM({ ok: "Booth details saved" }); setEdit(false); onChange(); }
    catch (err) { setM({ error: errMsg(err) }); }
  };
  const release = async () => {
    if (!window.confirm("Release this booth?")) return;
    try { await api.put(`/api/booths/${b._id}/release`); onChange(); } catch (err) { setM({ error: errMsg(err) }); }
  };
  const loadNeighbors = async () => {
    try { setNeighbors((await api.get(`/api/booths/${b._id}/neighbors`)).data.neighbors); } catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <article className="card">
      <h2>Booth {b.boothNumber} {statusChip(b.status)}</h2>
      <p className="muted">{b.expoId?.title} · {b.location} · {b.size} · ${b.price}</p>
      <Msg {...m} />
      {d.description && <p>{d.description}</p>}
      {d.products?.length > 0 && <p><b>Showcasing:</b> {d.products.join(", ")}</p>}
      {d.staff?.length > 0 && <p><b>Staff:</b> {d.staff.map((s) => s.name).join(", ")}</p>}
      <div className="row">
        <button className="btn outline" onClick={() => setEdit(!edit)}>Edit details</button>
        <button className="btn outline" onClick={loadNeighbors}>View neighbors</button>
        <button className="btn danger" onClick={release}>Release</button>
      </div>
      {edit && (
        <form onSubmit={save} style={{ marginTop: 12 }}>
          <Field label="Booth description" as="textarea" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <Field label="Products / services showcased (comma separated)" value={f.products} onChange={(e) => setF({ ...f, products: e.target.value })} />
          <Field label="Staff (one per line: name, email, phone)" as="textarea" rows={3} value={f.staff} onChange={(e) => setF({ ...f, staff: e.target.value })} />
          <button className="btn">Save</button>
        </form>
      )}
      {neighbors && (
        <div style={{ marginTop: 12 }}>
          <h3>Neighboring exhibitors</h3>
          {!neighbors.length && <p className="muted">No neighbors yet.</p>}
          {neighbors.map((n) => (
            <div className="item row" key={n.boothId}>
              <div className="grow"><b>{n.exhibitor.name}</b> · Booth {n.boothNumber}
                <div className="muted">{[n.contact.email, n.contact.phone, n.contact.website].filter(Boolean).join(" · ")}</div></div>
              <Link className="btn outline" to={`/messages/${n.exhibitor.id}?name=${encodeURIComponent(n.exhibitor.name)}`}>Message</Link>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function ExhibitorBooths() {
  const { data, error, reload } = useLoad(async () => (await api.get("/api/booths/my/list")).data.booths, []);
  return (
    <>
      <h1>My booths</h1>
      <p className="muted">To reserve a booth: open an expo → Floor plan (you need an approved application).</p>
      <Msg error={error} />
      {data && !data.length && <p className="muted">You have no booths yet.</p>}
      {data?.map((b) => <BoothCard key={b._id} b={b} onChange={reload} />)}
    </>
  );
}
