import { useState } from "react";
import api, { errMsg } from "../api";
import { Field, Msg, uploadFile, useLoad } from "../ui";

const empty = { title: "", description: "", theme: "", location: "", startDate: "", endDate: "", status: "published", floorPlanImage: "" };

export default function AdminExpos() {
  const { data, reload } = useLoad(async () => (await api.get("/api/expos")).data.expos, []);
  const [f, setF] = useState(empty);
  const [id, setId] = useState(null);
  const [m, setM] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const edit = (x) => {
    setId(x._id);
    setF({ title: x.title, description: x.description || "", theme: x.theme || "", location: x.location, startDate: x.startDate.slice(0, 10), endDate: x.endDate.slice(0, 10), status: x.status, floorPlanImage: x.floorPlanImage || "" });
    window.scrollTo(0, 0);
  };
  const save = async (e) => {
    e.preventDefault();
    try {
      if (id) await api.put(`/api/expos/${id}`, f); else await api.post("/api/expos", f);
      setM({ ok: id ? "Expo updated" : "Expo created" }); setId(null); setF(empty); reload();
    } catch (err) { setM({ error: errMsg(err) }); }
  };
  const del = async (x) => {
    if (!window.confirm(`Delete "${x.title}" with all its booths, sessions and applications?`)) return;
    try { await api.delete(`/api/expos/${x._id}`); reload(); } catch (err) { setM({ error: errMsg(err) }); }
  };
  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { const r = await uploadFile(file, "floorplans"); setF({ ...f, floorPlanImage: r.url }); setM({ ok: "Image uploaded. Now click Save changes (or Create expo) to keep it." }); } catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <div className="cols">
      <form className="card" onSubmit={save}>
        <h2>{id ? "Edit expo" : "Create expo"}</h2>
        <Msg {...m} />
        <Field label="Title" value={f.title} onChange={set("title")} required />
        <Field label="Description" as="textarea" rows={3} value={f.description} onChange={set("description")} />
        <Field label="Theme" value={f.theme} onChange={set("theme")} />
        <Field label="Location" value={f.location} onChange={set("location")} required />
        <div className="row">
          <div className="grow"><Field label="Start date" type="date" value={f.startDate} onChange={set("startDate")} required /></div>
          <div className="grow"><Field label="End date" type="date" value={f.endDate} onChange={set("endDate")} required /></div>
        </div>
        <Field label="Status" as="select" value={f.status} onChange={set("status")}>
          <option value="draft">Draft (hidden)</option><option value="published">Published</option><option value="completed">Completed</option>
        </Field>
        <div className="field"><label>Floor plan image<input type="file" accept="image/*" onChange={upload} /></label>
          {f.floorPlanImage && <img src={f.floorPlanImage} alt="Floor plan preview" width="200" style={{ borderRadius: 8, marginTop: 8 }} />}</div>
        <div className="row">
          <button className="btn">{id ? "Save changes" : "Create expo"}</button>
          {id && <button type="button" className="btn outline" onClick={() => { setId(null); setF(empty); }}>Cancel</button>}
        </div>
      </form>
      <section className="card">
        <h2>All expos</h2>
        {data?.map((x) => (
          <div className="item row" key={x._id}>
            {x.floorPlanImage && <img src={x.floorPlanImage} alt={`Floor plan of ${x.title}`} width="56" height="56" style={{ borderRadius: 10, objectFit: "cover" }} />}
            <div className="grow"><b>{x.title}</b> <span className="chip amber">{x.status}</span>
              <div className="muted">{new Date(x.startDate).toLocaleDateString()} · {x.location}</div></div>
            <button className="btn outline" onClick={() => edit(x)}>Edit</button>
            <button className="btn danger" onClick={() => del(x)}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}
