import api, { errMsg } from "../api";
import { Msg, fmt, useLoad } from "../ui";
import { useState } from "react";

export default function AdminFeedback() {
  const [err, setErr] = useState("");
  const { data, error, reload } = useLoad(async () => (await api.get("/api/feedback")).data.feedback, []);

  const setStatus = async (x, status) => {
    try { await api.put(`/api/feedback/${x._id}`, { status }); reload(); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <>
      <h1>User feedback &amp; issues</h1>
      <Msg error={error || err} />
      <div className="card">
        {data && !data.length && <p className="muted">No feedback yet.</p>}
        {data?.map((x) => (
          <div className="item row" key={x._id}>
            <div className="grow">
              <span className={`chip ${x.type === "issue" ? "red" : ""}`}>{x.type}</span> <span className={`chip ${x.status === "open" ? "amber" : ""}`}>{x.status}</span>
              <p style={{ margin: "6px 0" }}>{x.message}</p>
              <div className="muted">{x.userId ? `${x.userId.name} (${x.userId.email})` : "Anonymous"} · {fmt(x.createdAt)}</div>
            </div>
            {x.status === "open" ? <button className="btn" onClick={() => setStatus(x, "resolved")}>Mark resolved</button> : <button className="btn outline" onClick={() => setStatus(x, "open")}>Reopen</button>}
          </div>
        ))}
      </div>
    </>
  );
}
