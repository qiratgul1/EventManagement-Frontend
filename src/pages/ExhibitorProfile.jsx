import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { Field, Msg, list, uploadFile, useLoad } from "../ui";

export default function ExhibitorProfile() {
  const { data, error } = useLoad(async () => (await api.get("/api/exhibitors/profile")).data.profile, []);
  const [f, setF] = useState(null);
  const [m, setM] = useState({});

  useEffect(() => {
    if (data) setF({
      companyName: data.companyName || "", description: data.description || "", logo: data.logo || "", website: data.website || "",
      contactEmail: data.contactEmail || "", phone: data.phone || "", category: data.category || "",
      products: (data.products || []).join(", "), documents: data.documents || [],
    });
  }, [data]);

  if (!f) return error ? <Msg error={error} /> : <p>Loading…</p>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const upload = async (e, kind) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const r = await uploadFile(file, kind === "logo" ? "logos" : "documents");
      setF(kind === "logo" ? { ...f, logo: r.url } : { ...f, documents: [...f.documents, { name: r.name, url: r.url }] });
      setM({ ok: "File uploaded. Remember to save." });
    } catch (err) { setM({ error: errMsg(err) }); }
  };

  const save = async (e) => {
    e.preventDefault();
    try { await api.put("/api/exhibitors/profile", { ...f, products: list(f.products) }); setM({ ok: "Profile saved" }); }
    catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <form className="card" onSubmit={save} style={{ maxWidth: 720 }}>
      <h1>Company profile</h1>
      <Msg {...m} />
      <Field label="Company name" value={f.companyName} onChange={set("companyName")} required />
      <Field label="Description" as="textarea" rows={4} value={f.description} onChange={set("description")} />
      <Field label="Category" value={f.category} onChange={set("category")} placeholder="Technology" />
      <Field label="Products / services (comma separated)" value={f.products} onChange={set("products")} />
      <div className="row">
        <div className="grow"><Field label="Contact email" type="email" value={f.contactEmail} onChange={set("contactEmail")} /></div>
        <div className="grow"><Field label="Phone" value={f.phone} onChange={set("phone")} /></div>
      </div>
      <Field label="Website" value={f.website} onChange={set("website")} placeholder="https://" />
      <div className="field">
        <label>Logo (image, max 5 MB)<input type="file" accept="image/*" onChange={(e) => upload(e, "logo")} /></label>
        {f.logo && <img src={f.logo} alt="Company logo" width="96" style={{ borderRadius: 12, marginTop: 8 }} />}
      </div>
      <div className="field">
        <label>Required documents (PDF or image)<input type="file" accept="application/pdf,image/*" onChange={(e) => upload(e, "doc")} /></label>
        {f.documents.map((d, i) => (
          <div className="row" key={i}><a href={d.url} target="_blank" rel="noreferrer">{d.name}</a>
            <button type="button" className="btn danger" onClick={() => setF({ ...f, documents: f.documents.filter((_, j) => j !== i) })}>Remove</button></div>
        ))}
      </div>
      <button className="btn">Save profile</button>
    </form>
  );
}
