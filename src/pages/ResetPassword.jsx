import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { Field, Msg } from "../ui";
import AuthShell from "../components/AuthShell";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (password !== confirm) return setError("Passwords do not match");
    try {
      await api.post(`/reset-password/${token}`, { password });
      navigate("/login", { state: { ok: "Password reset. Please log in." } });
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <AuthShell>
      <h1>Reset password</h1>
      <Msg error={error} />
      <form onSubmit={submit}>
        <Field label="New password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Field label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <button className="btn">Reset password</button>
      </form>
      <p className="muted"><Link to="/login">Back to login</Link></p>
    </AuthShell>
  );
}
