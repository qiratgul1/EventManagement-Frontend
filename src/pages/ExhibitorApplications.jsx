import { useState } from "react";
import api, { errMsg } from "../api";
import { ExpoSelect, Field, Msg, list, statusChip, uploadFile, useLoad } from "../ui";

export default function ExhibitorApplications() {
  const [f, setF] = useState({ expoId: "", companyName: "", category: "", products: "", description: "", documents: [] });
  const [m, setM] = useState({});
  const apps = useLoad(async () => (await api.get("/api/applications/my")).data.applications, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const addDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { const r = await uploadFile(file, "documents"); setF({ ...f, documents: [...f.documents, { name: r.name, url: r.url }] }); }
    catch (err) { setM({ error: errMsg(err) }); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/applications", { ...f, products: list(f.products) });
      setM({ ok: "Application submitted. You will be notified after review." });
      setF({ ...f, products: "", description: "", documents: [] });
      apps.reload();
    } catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <div className="cols">
      <form className="card" onSubmit={submit}>
        <h2>Apply for an expo</h2>
        <Msg {...m} />
        <ExpoSelect value={f.expoId} onChange={(v) => setF((s) => ({ ...s, expoId: v }))} />
        <Field label="Company name" value={f.companyName} onChange={set("companyName")} required />
        <Field label="Category" value={f.category} onChange={set("category")} />
        <Field label="Products / services (comma separated)" value={f.products} onChange={set("products")} />
        <Field label="Description" as="textarea" rows={3} value={f.description} onChange={set("description")} />
        <div className="field">
          <label>Required documents<input type="file" accept="application/pdf,image/*" onChange={addDoc} /></label>
          {f.documents.map((d, i) => <div key={i} className="muted">📎 {d.name}</div>)}
        </div>
        <button className="btn" disabled={!f.expoId}>Submit application</button>
      </form>
      <section className="card">
        <h2>My applications</h2>
        <Msg error={apps.error} />
        {apps.data && !apps.data.length && <p className="muted">No applications yet.</p>}
        {apps.data?.map((a) => (
          <div className="item" key={a._id}>
            <b>{a.expoId?.title}</b> {statusChip(a.status)}
            <div className="muted">{a.companyName}{a.adminNote ? ` · Note: ${a.adminNote}` : ""}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
