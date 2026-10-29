import { useState } from "react";
import api, { errMsg } from "../api";
import { Field, Msg } from "../ui";

export default function Feedback() {
  const [f, setF] = useState({ type: "suggestion", message: "" });
  const [m, setM] = useState({});

  const submit = async (e) => {
    e.preventDefault(); setM({});
    try { await api.post("/api/feedback", f); setM({ ok: "Thank you for your feedback!" }); setF({ type: "suggestion", message: "" }); }
    catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h1>Feedback &amp; support</h1>
      <p className="muted">Send a suggestion or report an issue. Our team reads every message.</p>
      <Msg {...m} />
      <form onSubmit={submit}>
        <Field label="Type" as="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          <option value="suggestion">Suggestion</option>
          <option value="issue">Report an issue</option>
          <option value="other">Other</option>
        </Field>
        <Field label="Message" as="textarea" rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required />
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
