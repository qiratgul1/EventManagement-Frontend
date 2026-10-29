import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import { Field, Msg } from "../ui";
import AuthShell from "../components/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [m, setM] = useState({});

  const submit = async (e) => {
    e.preventDefault(); setM({});
    try { const { data } = await api.post("/forgot-password", { email }); setM({ ok: data.message }); }
    catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <AuthShell>
      <h1>Forgot password</h1>
      <p className="muted">Enter your email and we will send you a reset link (valid for 15 minutes).</p>
      <Msg {...m} />
      <form onSubmit={submit}>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn">Send reset link</button>
      </form>
      <p className="muted"><Link to="/login">Back to login</Link></p>
    </AuthShell>
  );
}
