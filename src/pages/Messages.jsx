import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Msg, useLoad } from "../ui";

export default function Messages() {
  const { userId } = useParams();
  const [sp] = useSearchParams();
  const { user, socket } = useAuth();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const box = useRef(null);
  const inbox = useLoad(async () => (await api.get("/api/messages/inbox")).data.conversations, []);
  const chat = useLoad(async () => (userId ? (await api.get(`/api/messages/${userId}`)).data.messages : []), [userId]);

  // real-time incoming messages
  useEffect(() => {
    if (!socket) return undefined;
    const h = () => { inbox.reload(); chat.reload(); };
    socket.on("new-message", h);
    return () => socket.off("new-message", h);
  }, [socket, userId]); // eslint-disable-line

  useEffect(() => { box.current?.scrollTo(0, box.current.scrollHeight); }, [chat.data]);

  const peer = inbox.data?.find((c) => c.peer._id === userId)?.peer;
  const name = peer?.name || sp.get("name") || "this user";

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post("/api/messages", { receiverId: userId, text });
      setText(""); setError(""); chat.reload(); inbox.reload();
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="cols cols-chat">
      <section className="card">
        <h2>Conversations</h2>
        <Msg error={inbox.error} />
        {inbox.data && !inbox.data.length && <p className="muted">No conversations yet. Open an exhibitor and press Chat.</p>}
        {inbox.data?.map((c) => (
          <Link key={c.peer._id} to={`/messages/${c.peer._id}`} className="item" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <b>{c.peer.name}</b> <span className="muted">({c.peer.role})</span>
            {c.unread > 0 && <span className="badge">{c.unread}</span>}
            <div className="muted">{c.lastMessage.text.slice(0, 50)}</div>
          </Link>
        ))}
      </section>
      <section className="card">
        {!userId ? <p className="muted">Select a conversation.</p> : (
          <>
            <h2>Chat with {name}</h2>
            <div className="chat" ref={box} aria-live="polite">
              {chat.data?.map((m) => (
                <div key={m._id} className={`bubble ${m.senderId === user._id ? "me" : ""}`}>{m.text}
                  <div className="muted" style={{ fontSize: 11 }}>{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <Msg error={error} />
            <form onSubmit={send} className="row">
              <div className="field grow" style={{ margin: 0 }}>
                <label className="sr" style={{ position: "absolute", left: -999 }}>Message</label>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" aria-label="Message" />
              </div>
              <button className="btn">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
