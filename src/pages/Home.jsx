import { Link } from "react-router-dom";
import api from "../api";
import { isStaff, useAuth } from "../AuthContext";
import { Msg, useLoad } from "../ui";
import ExpoCard from "../components/ExpoCard";

const FEATURES = [
  ["🎟️", "Discover expos", "Browse upcoming expos, see dates, themes and venues, and register in one click."],
  ["🗺️", "Live floor plans", "See which booths are free, reserved or taken, and watch the map update in real time."],
  ["📅", "Smart schedule", "Register for sessions, bookmark favourites and get a reminder before they start."],
  ["💬", "Chat and inquiries", "Message exhibitors, request appointments and get notified instantly."],
  ["🏷️", "Booth management", "Exhibitors apply, get approved and reserve a booth without any paperwork."],
  ["📊", "Analytics for organizers", "Track attendees, booth traffic and session popularity, and export reports."],
];

const WHO = [
  ["Attendees", ["Search exhibitors by product or category", "Register for expos and sessions", "Chat with exhibitors"]],
  ["Exhibitors", ["Create a company profile", "Apply and reserve your booth", "Meet your neighbouring exhibitors"]],
  ["Organizers", ["Create expos and floor plans", "Approve exhibitor applications", "Watch live analytics"]],
];

export default function Home() {
  const { user } = useAuth();
  const { data, error } = useLoad(async () => (await api.get("/api/expos", { params: { upcoming: true } })).data.expos, []);
  const myPlace = isStaff(user) ? "/admin" : user?.role === "exhibitor" ? "/exhibitor/profile" : "/agenda";

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Golden Hour</span>
        <h1>Every expo has its golden hour.</h1>
        <p>One glowing place for organizers, exhibitors and attendees: discover expos, reserve booths, plan sessions and connect live.</p>
        <div className="row">
          <Link className="btn amber" to="/expos">Browse expos</Link>
          {user
            ? <Link className="btn outline" to={myPlace}>Go to my space</Link>
            : <Link className="btn outline" to="/register">Create free account</Link>}
        </div>
      </section>

      <section className="section">
        <h2 className="title">Everything an expo needs</h2>
        <p className="lead">From the first booth application to the last session, Golden Hour keeps everyone in sync.</p>
        <div className="feat">
          {FEATURES.map(([icon, title, text]) => (
            <article className="card" key={title}>
              <span className="ico" aria-hidden="true">{icon}</span>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="title">Made for everyone at the expo</h2>
        <p className="lead">Pick your role when you join and get a space designed for you.</p>
        <div className="feat">
          {WHO.map(([role, points]) => (
            <article className="card" key={role}>
              <h3>{role}</h3>
              <ul className="check">{points.map((p) => <li key={p}>{p}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="title">Upcoming expos</h2>
        <p className="lead">Fresh from our organizers.</p>
        <Msg error={error} />
        {data && !data.length && <p className="muted" style={{ textAlign: "center" }}>No upcoming expos yet. Check back soon!</p>}
        <div className="grid">
          {data?.slice(0, 3).map((x) => <ExpoCard key={x._id} expo={x} />)}
        </div>
        <p style={{ textAlign: "center", marginTop: 20 }}><Link className="btn outline" to="/expos">See all expos</Link></p>
      </section>

      {!user && (
        <section className="hero cta">
          <h1>Ready for your golden hour?</h1>
          <p>Join as an attendee, exhibitor or organizer in under a minute.</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Link className="btn amber" to="/register">Join now</Link>
            <Link className="btn outline" to="/login">I already have an account</Link>
          </div>
        </section>
      )}
    </>
  );
}
