import { useEffect } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Msg, fmt, useLoad } from "../ui";

export default function Notifications() {
  const { setUnread, socket } = useAuth();
  const { data, error, reload } = useLoad(async () => (await api.get("/api/notifications")).data.notifications, []);

  // real-time: refresh list when a new notification arrives
  useEffect(() => {
    if (!socket) return undefined;
    socket.on("new-notification", reload);
    return () => socket.off("new-notification", reload);
  }, [socket]); // eslint-disable-line

  const markRead = async () => {
    try { await api.put("/api/notifications/read"); setUnread(0); reload(); } catch (e) { window.alert(errMsg(e)); }
  };

  return (
    <div className="card">
      <div className="row"><h1 className="grow">Notifications</h1><button className="btn outline" onClick={markRead}>Mark all as read</button></div>
      <Msg error={error} />
      {data && !data.length && <p className="muted">You are all caught up.</p>}
      {data?.map((n) => (
        <div className="item" key={n._id} style={{ fontWeight: n.read ? 400 : 700 }}>
          {n.title} {!n.read && <span className="chip amber">new</span>}
          <div className="muted" style={{ fontWeight: 400 }}>{n.message} · {fmt(n.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}
