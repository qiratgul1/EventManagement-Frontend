import api, { errMsg } from "../api";
import { Link } from "react-router-dom";
import { Msg, fmt, useLoad } from "../ui";
import { useState } from "react";

export default function MyAgenda() {
  const [err, setErr] = useState("");
  const { data, error, reload } = useLoad(async () => (await api.get("/api/registrations/my")).data.registrations, []);
  const expos = data?.filter((r) => !r.sessionId && r.type === "registration") || [];
  const sessions = data?.filter((r) => r.sessionId) || [];

  const remove = async (r) => {
    try { await api.delete(`/api/sessions/${r.sessionId._id}/${r.type === "registration" ? "register" : "bookmark"}`); reload(); }
    catch (e) { setErr(errMsg(e)); }
  };

  return (
    <>
      <h1>My agenda</h1>
      <Msg error={error || err} />
      <section className="card">
        <h2>Expos I registered for</h2>
        {!expos.length && <p className="muted">None yet. <Link to="/expos">Browse expos</Link></p>}
        {expos.map((r) => <div className="item" key={r._id}><Link to={`/expos/${r.expoId?._id}`}>{r.expoId?.title}</Link> <span className="muted">· {r.expoId?.location}</span></div>)}
      </section>
      <section className="card">
        <h2>Sessions (registered &amp; bookmarked)</h2>
        {!sessions.length && <p className="muted">No sessions saved yet.</p>}
        {sessions.map((r) => (
          <div className="item row" key={r._id}>
            <div className="grow"><b>{r.sessionId.title}</b> <span className={`chip ${r.type === "bookmark" ? "amber" : ""}`}>{r.type === "bookmark" ? "bookmarked" : "registered"}</span>
              <div className="muted">{fmt(r.sessionId.startTime)} · {r.sessionId.location || "location TBA"}</div></div>
            <button className="btn danger" onClick={() => remove(r)}>Remove</button>
          </div>
        ))}
      </section>
    </>
  );
}
