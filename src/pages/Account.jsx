import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Field, Msg } from "../ui";

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: user.name, consent: !!user.consent });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [m1, setM1] = useState({});
  const [m2, setM2] = useState({});
  const [m3, setM3] = useState({});

  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const roleLabel = ["admin", "organizer"].includes(user.role) ? "Organizer / Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null;

  const saveProfile = async (e) => {
    e.preventDefault();
    try { const { data } = await api.put("/api/me", f); setUser(data.user); setM1({ ok: "Account updated" }); }
    catch (err) { setM1({ error: errMsg(err) }); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    try { await api.put("/api/change-password", pw); setM2({ ok: "Password changed" }); setPw({ currentPassword: "", newPassword: "" }); }
    catch (err) { setM2({ error: errMsg(err) }); }
  };
  const exportData = async () => {
    try {
      const { data } = await api.get("/api/me/export");
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = "my-golden-hour-data.json"; a.click(); URL.revokeObjectURL(url);
      setM3({ ok: "Your data was downloaded" });
    } catch (err) { setM3({ error: errMsg(err) }); }
  };
  const del = async () => {
    if (!window.confirm("Permanently delete your account and personal data?")) return;
    try { await api.delete("/api/me"); logout(); navigate("/register"); } catch (err) { setM3({ error: errMsg(err) }); }
  };

  return (
    <>
      <h1>My account</h1>
      <div className="cols">
        <div>
          <form className="card" onSubmit={saveProfile}>
            <h2>Profile &amp; privacy</h2>
            <Msg {...m1} />
            <Field label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
            <div className="field"><label><input type="checkbox" style={{ display: "inline", width: "auto", minHeight: 0, marginRight: 8 }} checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />I consent to data processing</label></div>
            <button className="btn">Save changes</button>
          </form>
          <form className="card" onSubmit={changePw}>
            <h2>Change password</h2>
            <Msg {...m2} />
            <Field label="Current password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
            <Field label="New password (min 6 characters)" type="password" minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
            <button className="btn">Change password</button>
          </form>
        </div>

        <div>
          <section className="card profile-card">
            <span className="avatar big" aria-hidden="true">{initials}</span>
            <h2>{user.name}</h2>
            <p className="muted">{user.email}</p>
            <div className="row" style={{ justifyContent: "center" }}>
              <span className="chip">{roleLabel}</span>
              <span className={`chip ${user.consent ? "" : "amber"}`}>{user.consent ? "Consent given" : "Consent missing"}</span>
            </div>
            {joined && <p className="muted" style={{ marginTop: 14 }}>Member since {joined}</p>}
          </section>
          <section className="card">
            <h2>Your data (GDPR)</h2>
            <p className="muted">Download a copy of everything we store about you, or delete your account and personal data for good.</p>
            <Msg {...m3} />
            <div className="stack">
              <button className="btn outline" onClick={exportData}>Download my data</button>
              <button className="btn danger" onClick={del}>Delete my account</button>
            </div>
          </section>
          <section className="card">
            <h2>Security tips</h2>
            <ul className="tips">
              <li>Use a password you don&apos;t use anywhere else.</li>
              <li>Log out when you use a shared computer.</li>
              <li>Never share your organizer signup code.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
