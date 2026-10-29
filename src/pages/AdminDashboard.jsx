import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { ExpoSelect, Msg, useLoad } from "../ui";

const LABELS = {
  "expo-registration": "New expo registration", "new-application": "New exhibitor application",
  "session-registration": "Session registration", "session-bookmark": "Session bookmarked",
};

export default function AdminDashboard() {
  const { socket } = useAuth();
  const [expoId, setExpoId] = useState("");
  const [feed, setFeed] = useState([]);
  const { data, error, reload } = useLoad(async () => (expoId ? (await api.get(`/api/analytics/${expoId}`)).data : null), [expoId]);

  // real-time analytics
  useEffect(() => {
    if (!socket) return undefined;
    const h = (e) => {
      setFeed((f) => [{ text: LABELS[e.event] || e.event, at: new Date().toLocaleTimeString() }, ...f].slice(0, 8));
      if (String(e.expoId) === expoId) reload();
    };
    socket.on("analytics-update", h);
    return () => socket.off("analytics-update", h);
  }, [socket, expoId]); // eslint-disable-line

  const count = (arr, k) => arr?.find((x) => x._id === k)?.count || 0;
  const total = (arr) => (arr || []).reduce((s, x) => s + x.count, 0);
  const row = (label, value, tot) => (
    <div key={label} style={{ marginBottom: 12 }}>
      <div className="row"><span className="grow">{label}</span><b>{value}</b></div>
      <div className="bar"><i style={{ width: `${tot ? (value / tot) * 100 : 0}%` }} /></div>
    </div>
  );
  const maxReg = Math.max(1, ...(data?.sessionPopularity || []).map((s) => s.registrations));

  return (
    <>
      <h1>Dashboard</h1>
      <ExpoSelect value={expoId} onChange={setExpoId} />
      <Msg error={error} />
      {data && (
        <>
          <div className="grid">
            <div className="card"><div className="muted">Registered attendees</div><div className="stat">{data.attendeeEngagement.registeredAttendees}</div></div>
            <div className="card"><div className="muted">Pending applications</div><div className="stat">{count(data.applicationsByStatus, "pending")}</div></div>
            <div className="card"><div className="muted">Booths taken</div><div className="stat">{count(data.boothsByStatus, "occupied") + count(data.boothsByStatus, "reserved")} / {total(data.boothsByStatus)}</div></div>
            <div className="card"><div className="muted">Sessions · expo page views</div><div className="stat">{data.totalSessions} · {data.expo.pageViews}</div></div>
          </div>
          <div className="cols">
            <section className="card">
              <h2>Session popularity</h2>
              {!data.sessionPopularity.length && <p className="muted">No session registrations yet.</p>}
              {data.sessionPopularity.map((s) => (
                <div key={s._id} style={{ marginBottom: 12 }}>
                  <div className="row"><b className="grow">{s.title}</b><span>{s.registrations} registered · {s.bookmarks} bookmarks</span></div>
                  <div className="bar"><i style={{ width: `${(s.registrations / maxReg) * 100}%` }} /></div>
                </div>
              ))}
              <h2 style={{ marginTop: 20 }}>Booth traffic (top 5)</h2>
              {!data.boothTraffic.length && <p className="muted">No booths yet.</p>}
              {data.boothTraffic.map((b) => <div className="item row" key={b._id}><b className="grow">Booth {b.boothNumber}</b><span>{b.views} views</span></div>)}
            </section>
            <div>
              <section className="card" aria-live="polite">
                <h2>Live activity</h2>
                {!feed.length && (
                  <p className="muted"><span className="pulse" style={{ display: "inline-block", marginRight: 10 }} />Listening for new registrations, applications and bookings…</p>
                )}
                {feed.map((x, i) => <div className="item" key={i}>{x.text} <span className="muted">· {x.at}</span></div>)}
              </section>
              <section className="card">
                <h2>Status overview</h2>
                <h3 className="muted">Applications</h3>
                {row("Pending", count(data.applicationsByStatus, "pending"), total(data.applicationsByStatus))}
                {row("Approved", count(data.applicationsByStatus, "approved"), total(data.applicationsByStatus))}
                {row("Rejected", count(data.applicationsByStatus, "rejected"), total(data.applicationsByStatus))}
                <h3 className="muted" style={{ marginTop: 16 }}>Booths</h3>
                {row("Available", count(data.boothsByStatus, "available"), total(data.boothsByStatus))}
                {row("Reserved", count(data.boothsByStatus, "reserved"), total(data.boothsByStatus))}
                {row("Occupied", count(data.boothsByStatus, "occupied"), total(data.boothsByStatus))}
              </section>
              <section className="card">
                <h2>Quick actions</h2>
                <div className="stack">
                  <Link className="btn outline" to="/admin/applications">Review applications</Link>
                  <Link className="btn outline" to="/admin/booths">Manage booths</Link>
                  <Link className="btn outline" to="/admin/schedule">Manage schedule</Link>
                  <Link className="btn outline" to="/admin/expos">Create or edit expos</Link>
                  <Link className="btn" to="/admin/reports">Download reports</Link>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}
