import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const PILLARS = [
  ["🧭", "Simple", "One clear space for every role, so nobody has to chase emails or spreadsheets."],
  ["⚡", "Live", "Booths, schedules, chat and notifications update the moment something changes."],
  ["🔒", "Secure", "Encrypted passwords, role-based access and full control over your own data."],
];

export default function About() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <span className="eyebrow">About us</span>
        <h1>We make expos feel effortless.</h1>
        <p>Golden Hour brings organizers, exhibitors and attendees together in one platform, so the best moments of every expo are easy to plan and impossible to miss.</p>
      </section>

      <section className="card">
        <h2>Our story</h2>
        <p>Running an expo used to mean manual registrations, scattered messages and little visibility into what was happening on the floor. Golden Hour replaces that with one connected experience: organizers manage events, exhibitors showcase their business, and attendees find exactly who and what they came for.</p>
        <p className="muted">Our name comes from the hour when everything glows: the moment an expo is at its best.</p>
      </section>

      <section className="section">
        <h2 className="title">What we believe in</h2>
        <div className="feat">
          {PILLARS.map(([icon, title, text]) => (
            <article className="card" key={title}>
              <span className="ico" aria-hidden="true">{icon}</span>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hero cta">
        <h1>Let&apos;s build your next expo together.</h1>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link className="btn amber" to="/contact">Contact us</Link>
          {!user && <Link className="btn outline" to="/register">Create account</Link>}
        </div>
      </section>
    </>
  );
}
