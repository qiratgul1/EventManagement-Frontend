import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Field, Msg, statusChip, useLoad } from "../ui";

// mode: "view" (attendee/guest) | "exhibitor" (reserve / release) | "admin" (assign / release / delete)
export default function FloorPlan({ expoId, mode = "view", image }) {
  const { user, socket } = useAuth();
  const [sel, setSel] = useState(null);
  const [pick, setPick] = useState("");
  const [m, setM] = useState({});
  const [imgFail, setImgFail] = useState(false);
  const booths = useLoad(async () => (await api.get(`/api/booths/expo/${expoId}`)).data.booths, [expoId]);
  const exhibitors = useLoad(async () => (mode === "admin" ? (await api.get("/api/users", { params: { role: "exhibitor" } })).data.users : []), [mode]);

  // real-time booth changes
  useEffect(() => {
    if (!socket) return undefined;
    socket.emit("join-expo", expoId);
    socket.on("booth-updated", booths.reload);
    return () => socket.off("booth-updated", booths.reload);
  }, [socket, expoId]); // eslint-disable-line

  const open = async (b) => {
    try { setSel((await api.get(`/api/booths/${b._id}`)).data.booth); } catch (e) { setSel(b); }
    setM({});
  };
  const act = async (fn, okText) => {
    try {
      await fn(); setM({ ok: okText });
      booths.reload();
      setSel((await api.get(`/api/booths/${sel._id}`)).data.booth);
    } catch (e) { setM({ error: errMsg(e) }); }
  };

  const mine = sel && user && sel.exhibitorId?._id === user._id;
  const d = sel?.details;

  return (
    <div className="cols">
      <section className="card">
        <h2>Floor plan</h2>
        {image && !imgFail && <img src={image} alt="Venue floor plan" onError={() => setImgFail(true)} style={{ maxWidth: "100%", borderRadius: 12, marginBottom: 12 }} />}
        {image && imgFail && <p className="msg err">The floor plan image could not be loaded. Re-upload it as a JPG or PNG.</p>}
        <p className="muted">▢ Available (dashed) &nbsp; ■ Reserved (amber) &nbsp; ■ Occupied (green)</p>
        <Msg error={booths.error} />
        {booths.data && !booths.data.length && <p className="muted">No booths added yet.</p>}
        <div className="booths">
          {booths.data?.map((b) => (
            <button key={b._id} className={`booth ${b.status} ${sel?._id === b._id ? "sel" : ""}`} aria-label={`Booth ${b.boothNumber}, ${b.status}`} onClick={() => open(b)}>
              {b.boothNumber}
            </button>
          ))}
        </div>
      </section>

      <aside className="card" aria-live="polite">
        {!sel ? <p className="muted">Select a booth to see details.</p> : (
          <>
            <h2>Booth {sel.boothNumber} {statusChip(sel.status)}</h2>
            <p className="muted">{sel.size} · {sel.location}</p>
            <div className="stat">${sel.price}</div>
            {sel.features?.length > 0 && <p>Features: {sel.features.join(", ")}</p>}
            {sel.exhibitorId && <p><b>Exhibitor:</b> {sel.exhibitorId.name}</p>}
            {d?.description && <p>{d.description}</p>}
            {d?.products?.length > 0 && <p><b>Products:</b> {d.products.join(", ")}</p>}
            <Msg {...m} />

            {mode === "exhibitor" && sel.status === "available" && (
              <button className="btn" onClick={() => act(() => api.put(`/api/booths/${sel._id}/reserve`), "Booth reserved!")}>Reserve this booth</button>
            )}
            {mode === "exhibitor" && mine && sel.status !== "available" && (
              <button className="btn danger" onClick={() => act(() => api.put(`/api/booths/${sel._id}/release`), "Booth released")}>Release booth</button>
            )}
            {mode === "admin" && (
              <>
                {sel.status !== "occupied" && (
                  <>
                    <Field label="Assign to exhibitor" as="select" value={pick} onChange={(e) => setPick(e.target.value)}>
                      <option value="">Select…</option>
                      {exhibitors.data?.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                    </Field>
                    <button className="btn" disabled={!pick} onClick={() => act(() => api.put(`/api/booths/${sel._id}/assign`, { exhibitorId: pick }), "Booth assigned")}>Assign booth</button>{" "}
                  </>
                )}
                {sel.status !== "available" && <button className="btn outline" onClick={() => act(() => api.put(`/api/booths/${sel._id}/release`), "Booth released")}>Release</button>}{" "}
                <button className="btn danger" onClick={async () => {
                  if (!window.confirm("Delete this booth?")) return;
                  try { await api.delete(`/api/booths/${sel._id}`); setSel(null); booths.reload(); } catch (e) { setM({ error: errMsg(e) }); }
                }}>Delete</button>
              </>
            )}
            {mode === "view" && !user && <p className="muted">Log in as an exhibitor to reserve booths.</p>}
          </>
        )}
      </aside>
    </div>
  );
}
