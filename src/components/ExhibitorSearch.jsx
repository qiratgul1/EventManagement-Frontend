import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Field, Msg, useLoad } from "../ui";

export default function ExhibitorSearch({ expoId }) {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(null);
  const [inq, setInq] = useState({ subject: "", message: "", preferredTime: "" });
  const [m, setM] = useState({});
  const { data, error } = useLoad(
    async () => (await api.get(`/api/expos/${expoId}/exhibitors`, { params: { search: q || undefined, category: category || undefined } })).data.exhibitors,
    [expoId, q, category]
  );

  const send = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/exhibitors/${open}/inquiry`, inq);
      setM({ ok: "Inquiry sent!" }); setOpen(null); setInq({ subject: "", message: "", preferredTime: "" });
    } catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <section className="card">
      <h2>Find exhibitors</h2>
      <div className="row">
        <div className="grow"><Field label="Search by name, product or keyword" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="grow"><Field label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Technology" /></div>
      </div>
      <Msg error={error} {...m} />
      {data && !data.length && <p className="muted">No approved exhibitors match yet.</p>}
      {data?.map((x) => (
        <div className="item" key={x.exhibitorId}>
          <div className="row">
            {x.profile?.logo && <img src={x.profile.logo} alt={`${x.companyName} logo`} width="48" height="48" style={{ borderRadius: 12, objectFit: "cover" }} />}
            <div className="grow">
              <h3>{x.companyName}</h3>
              <div className="muted">{x.category} {x.products?.length ? `· ${x.products.join(", ")}` : ""}</div>
            </div>
            {x.booths?.map((b) => <span key={b._id} className="chip amber">Booth {b.boothNumber} · {b.location}</span>)}
          </div>
          {x.description && <p>{x.description}</p>}
          {x.profile?.website && <p className="muted">Website: <a href={x.profile.website} target="_blank" rel="noreferrer">{x.profile.website}</a></p>}
          {user && (
            <div className="row">
              <Link className="btn outline" to={`/messages/${x.exhibitorId}?name=${encodeURIComponent(x.companyName)}`}>Chat</Link>
              <button className="btn outline" onClick={() => setOpen(open === x.exhibitorId ? null : x.exhibitorId)}>Send inquiry / request appointment</button>
            </div>
          )}
          {open === x.exhibitorId && (
            <form onSubmit={send} style={{ marginTop: 12 }}>
              <Field label="Subject" value={inq.subject} onChange={(e) => setInq({ ...inq, subject: e.target.value })} />
              <Field label="Message" as="textarea" rows={3} value={inq.message} onChange={(e) => setInq({ ...inq, message: e.target.value })} required />
              <Field label="Preferred appointment time (optional)" value={inq.preferredTime} onChange={(e) => setInq({ ...inq, preferredTime: e.target.value })} placeholder="Dec 10, 2pm" />
              <button className="btn">Send</button>
            </form>
          )}
        </div>
      ))}
      {!user && <p className="muted">Log in to chat or send inquiries.</p>}
    </section>
  );
}
