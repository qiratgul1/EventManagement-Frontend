import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { Field, Msg } from "../ui";
import AuthShell from "../components/AuthShell";

export default function Register() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", role: "attendee", adminCode: "", consent: false });
  const [error, setError] = useState("");
  const staff = ["admin", "organizer"].includes(f.role);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (!f.consent) return setError("Please accept the privacy consent to continue");
    try {
      await api.post("/register", { ...f, adminCode: staff ? f.adminCode : undefined });
      navigate("/login", { state: { ok: "Account created. Please log in." } });
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <AuthShell>
      <h1>Create account</h1>
      <Msg error={error} />
      <form onSubmit={submit}>
        <Field label="Full name" value={f.name} onChange={set("name")} required />
        <Field label="Email" type="email" value={f.email} onChange={set("email")} required />
        <Field label="Password (min 6 characters)" type="password" minLength={6} value={f.password} onChange={set("password")} required />
        <Field label="I am a" as="select" value={f.role} onChange={set("role")}>
          <option value="attendee">Attendee</option>
          <option value="exhibitor">Exhibitor</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </Field>
        {staff && <Field label="Organizer signup code" type="password" value={f.adminCode} onChange={set("adminCode")} required />}
        <div className="field">
          <label>
            <input type="checkbox" style={{ display: "inline", width: "auto", minHeight: 0, marginRight: 8 }} checked={f.consent} onChange={set("consent")} />
            I consent to my data being processed (GDPR)
          </label>
        </div>
        <button className="btn">Register</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </AuthShell>
  );
}
