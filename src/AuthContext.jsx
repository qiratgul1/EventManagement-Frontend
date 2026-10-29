import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api, { BASE } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export const isStaff = (u) => !!u && ["admin", "organizer"].includes(u.role);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState("");

  const flash = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 5000);
  };

  const loadUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/api/notifications");
      setUnread(data.notifications.filter((n) => !n.read).length);
    } catch (e) { /* ignore */ }
  }, []);

  // restore session on page load
  useEffect(() => {
    if (!localStorage.getItem("token")) { setLoading(false); return; }
    api.get("/api/me")
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // real-time connection while logged in
  useEffect(() => {
    if (!user) { setSocket(null); setUnread(0); return undefined; }
    loadUnread();
    // live updates need a long-running server; set VITE_DISABLE_SOCKET=true when the backend is serverless (Vercel)
    if (import.meta.env.VITE_DISABLE_SOCKET === "true") return undefined;
    const s = io(BASE, { auth: { token: localStorage.getItem("token") } });
    s.on("new-notification", (n) => { setUnread((u) => u + 1); flash(`${n.title}: ${n.message}`); });
    s.on("new-message", () => flash("New message received"));
    setSocket(s);
    return () => s.disconnect();
  }, [user, loadUnread]);

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem("token", data.token);
    const me = await api.get("/api/me");
    setUser(me.data.user);
    return me.data.user;
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return (
    <Ctx.Provider value={{ user, setUser, loading, login, logout, socket, unread, setUnread }}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </Ctx.Provider>
  );
}
