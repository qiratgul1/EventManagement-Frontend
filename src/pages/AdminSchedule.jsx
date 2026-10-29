import { useState } from "react";
import api, { errMsg } from "../api";
import { ExpoSelect, Field, Msg, fmt, toLocalInput, useLoad } from "../ui";

const empty = { title: "", topic: "", speaker: "", location: "", startTime: "", endTime: "", capacity: "", description: "" };

export default function AdminSchedule() {
  const [expoId, setExpoId] = useState("");
  const [f, setF] = useState(empty);
  const [id, setId] = useState(null);
  const [m, setM] = useState({});
  const { data, reload } = useLoad(async () => (expoId ? (await api.get("/api/sessions", { params: { expoId } })).data.sessions : []), [expoId]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const edit = (s) => {
    setId(s._id);
    setF({ title: s.title, topic: s.topic || "", speaker: s.speaker || "", location: s.location || "", startTime: toLocalInput(s.startTime), endTime: toLocalInput(s.endTime), capacity: s.capacity || "", description: s.description || "" });
    window.scrollTo(0, 0);
  };
  const save = async (e) => {
    e.preventDefault();
    const body = { ...f, expoId, startTime: new Date(f.startTime).toISOString(), endTime: new Date(f.endTime).toISOString(), capacity: f.capacity ? +f.capacity : undefined };
    try {
      if (id) await api.put(`/api/sessions/${id}`, body); else await api.post("/api/sessions", body);
      setM({ ok: id ? "Session updated. Registered attendees were notified." : "Session created" }); setId(null); setF(empty); reload();
    } catch (err) { setM({ error: errMsg(err) }); }
  };
  const del = async (s) => {
    if (!window.confirm(`Delete session "${s.title}"?`)) return;
    try { await api.delete(`/api/sessions/${s._id}`); reload(); } catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <>
      <h1>Schedule management</h1>
      <ExpoSelect value={expoId} onChange={setExpoId} />
      <div className="cols">
        <form className="card" onSubmit={save}>
          <h2>{id ? "Edit session" : "Add session"}</h2>
          <Msg {...m} />
          <Field label="Title" value={f.title} onChange={set("title")} required />
          <Field label="Speaker" value={f.speaker} onChange={set("speaker")} />
          <Field label="Topic" value={f.topic} onChange={set("topic")} />
          <Field label="Location / room" value={f.location} onChange={set("location")} />
          <Field label="Starts" type="datetime-local" value={f.startTime} onChange={set("startTime")} required />
          <Field label="Ends" type="datetime-local" value={f.endTime} onChange={set("endTime")} required />
          <Field label="Capacity (optional)" type="number" min="1" value={f.capacity} onChange={set("capacity")} />
          <Field label="Description" as="textarea" rows={3} value={f.description} onChange={set("description")} />
          <div className="row">
            <button className="btn" disabled={!expoId}>{id ? "Save changes" : "Add session"}</button>
            {id && <button type="button" className="btn outline" onClick={() => { setId(null); setF(empty); }}>Cancel</button>}
          </div>
        </form>
        <section className="card">
          <h2>Sessions</h2>
          {data && !data.length && <p className="muted">No sessions yet.</p>}
          {data?.map((s) => (
            <div className="item row" key={s._id}>
              <div className="grow"><b>{s.title}</b><div className="muted">{fmt(s.startTime)} · {[s.speaker, s.location].filter(Boolean).join(" · ")}</div></div>
              <button className="btn outline" onClick={() => edit(s)}>Edit</button>
              <button className="btn danger" onClick={() => del(s)}>Delete</button>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
