import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { errMsg } from "../api";
import { Field, Msg } from "../ui";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [f, setF] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const u = await login(f.email, f.password);
      navigate(["admin", "organizer"].includes(u.role) ? "/admin" : u.role === "exhibitor" ? "/exhibitor/profile" : "/expos");
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell>
      <h1>Log in</h1>
      <Msg error={error} ok={location.state?.ok} />
      <form onSubmit={submit}>
        <Field label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <Field label="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Log in"}</button>
      </form>
      <p className="muted"><Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create account</Link></p>
    </AuthShell>
  );
}
