import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Msg, useLoad } from "../ui";
import ExpoCard from "../components/ExpoCard";

export default function Expos() {
  const [q, setQ] = useState("");
  const [upcoming, setUpcoming] = useState(false);
  const { data, error, loading } = useLoad(
    async () => (await api.get("/api/expos", { params: { search: q || undefined, upcoming: upcoming || undefined } })).data.expos,
    [q, upcoming]
  );

  return (
    <>
      <div className="hero">
        <span className="eyebrow">Golden Hour</span>
        <h1>Find the expo that lights you up</h1>
        <p>Browse events, meet exhibitors, book sessions and reserve booths, all in one glowing place.</p>
      </div>
      <div className="card row">
        <div className="field grow" style={{ margin: 0 }}>
          <label>Search expos<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Tech Expo" /></label>
        </div>
        <label className="row">
          <input type="checkbox" checked={upcoming} onChange={(e) => setUpcoming(e.target.checked)} /> Upcoming only
        </label>
      </div>
      <Msg error={error} />
      {loading && <p>Loading…</p>}
      {data && !data.length && <p className="muted">No expos found.</p>}
      <div className="grid">
        {data?.map((x) => <ExpoCard key={x._id} expo={x} />)}
      </div>
    </>
  );
}
