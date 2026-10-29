import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { isStaff, useAuth } from "../AuthContext";
import { Msg, useLoad } from "../ui";

export default function Schedule({ expoId }) {
  const { user, socket } = useAuth();
  const [err, setErr] = useState("");
  const canJoin = user && !isStaff(user);
  const sessions = useLoad(async () => (await api.get("/api/sessions", { params: { expoId } })).data.sessions, [expoId]);
  const mine = useLoad(async () => (canJoin ? (await api.get("/api/registrations/my")).data.registrations : []), [canJoin]);

  // real-time schedule changes
  useEffect(() => {
    if (!socket) return undefined;
    socket.emit("join-expo", expoId);
    socket.on("schedule-updated", sessions.reload);
    return () => socket.off("schedule-updated", sessions.reload);
  }, [socket, expoId]); // eslint-disable-line

  const has = (sid, type) => mine.data?.some((r) => r.sessionId?._id === sid && r.type === type);
  const toggle = async (sid, type) => {
    const path = `/api/sessions/${sid}/${type === "registration" ? "register" : "bookmark"}`;
    try {
      if (has(sid, type)) await api.delete(path); else await api.post(path);
      setErr(""); mine.reload();
    } catch (e) { setErr(errMsg(e)); }
  };

  const days = {};
  (sessions.data || []).forEach((s) => { const d = new Date(s.startTime).toDateString(); (days[d] = days[d] || []).push(s); });

  return (
    <section className="card">
      <h2>Event schedule</h2>
      <Msg error={sessions.error || err} />
      {sessions.data && !sessions.data.length && <p className="muted">No sessions scheduled yet.</p>}
      {Object.entries(days).map(([day, list]) => (
        <div key={day}>
          <h3 style={{ marginTop: 16 }}>{day}</h3>
          {list.map((s) => (
            <div className="item row" key={s._id}>
              <b style={{ width: 70, color: "var(--teal)" }}>{new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b>
              <div className="grow">
                <b>{s.title}</b>
                <div className="muted">{[s.speaker, s.topic, s.location].filter(Boolean).join(" · ")}{s.capacity ? ` · ${s.capacity} seats` : ""}</div>
              </div>
              {canJoin && (
                <>
                  <button className={`btn ${has(s._id, "registration") ? "" : "outline"}`} onClick={() => toggle(s._id, "registration")}>{has(s._id, "registration") ? "Registered ✓" : "Register"}</button>
                  <button className={`btn ${has(s._id, "bookmark") ? "amber" : "outline"}`} onClick={() => toggle(s._id, "bookmark")}>{has(s._id, "bookmark") ? "Bookmarked ★" : "Bookmark"}</button>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
      {!user && <p className="muted">Log in as an attendee to register or bookmark sessions.</p>}
    </section>
  );
}
