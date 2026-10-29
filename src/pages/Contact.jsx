import { useState } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Field, Msg } from "../ui";

// Edit these with your real contact details
const CONTACT = { email: "your-email@example.com", phone: "+00 000 0000000", hours: "Monday to Friday, 9am to 6pm" };

const FAQ = [
  ["Do I need an account to browse expos?", "No. Anyone can browse expos and exhibitors. You need a free account to register, book sessions or chat."],
  ["How do I exhibit at an expo?", "Create an account as an Exhibitor, complete your profile and apply to the expo. Once an organizer approves you, reserve a booth on the floor plan."],
  ["I forgot my password. What now?", "Use the “Forgot password?” link on the login page. We email you a link that works for 15 minutes."],
  ["Can I delete my data?", "Yes. Open My account and choose “Delete my account” to remove your account and personal data."],
];

export default function Contact() {
  const { user } = useAuth();
  const [f, setF] = useState({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
  const [m, setM] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setM({});
    try {
      await api.post("/api/feedback", {
        type: "other",
        message: `[Contact form]\nName: ${f.name}\nEmail: ${f.email}\nSubject: ${f.subject || "-"}\n\n${f.message}`,
      });
      setM({ ok: "Thank you! We received your message and will reply by email." });
      setF({ ...f, subject: "", message: "" });
    } catch (err) { setM({ error: errMsg(err) }); }
    finally { setBusy(false); }
  };

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Contact</span>
        <h1>We&apos;d love to hear from you.</h1>
        <p>Questions, ideas or need help with your expo? Send us a message.</p>
      </section>

      <div className="cols">
        <form className="card" onSubmit={submit}>
          <h2>Send a message</h2>
          <Msg {...m} />
          <div className="row">
            <div className="grow"><Field label="Your name" value={f.name} onChange={set("name")} required /></div>
            <div className="grow"><Field label="Email" type="email" value={f.email} onChange={set("email")} required /></div>
          </div>
          <Field label="Subject" value={f.subject} onChange={set("subject")} />
          <Field label="Message" as="textarea" rows={6} value={f.message} onChange={set("message")} required />
          <button className="btn" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
        </form>

        <div>
          <section className="card">
            <h2>Get in touch</h2>
            <p><b>Email</b><br /><span className="muted">{CONTACT.email}</span></p>
            <p><b>Phone</b><br /><span className="muted">{CONTACT.phone}</span></p>
            <p><b>Hours</b><br /><span className="muted">{CONTACT.hours}</span></p>
          </section>
          <section className="card">
            <h2>Quick answers</h2>
            {FAQ.map(([q, a]) => (
              <details className="faq" key={q}>
                <summary>{q}</summary>
                <p className="muted">{a}</p>
              </details>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
