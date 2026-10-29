import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { isStaff, useAuth } from "../AuthContext";
import { Msg, useLoad } from "../ui";
import ExhibitorSearch from "../components/ExhibitorSearch";
import Schedule from "../components/Schedule";
import FloorPlan from "../components/FloorPlan";

export default function ExpoDetail() {
  const { id } = useParams();
  const { user, socket } = useAuth();
  const [tab, setTab] = useState("exhibitors");
  const [m, setM] = useState({});
  const [planFail, setPlanFail] = useState(false);
  const { data: expo, error, reload } = useLoad(async () => (await api.get(`/api/expos/${id}`)).data.expo, [id]);

  // real-time: refresh when organizers edit this expo
  useEffect(() => {
    if (!socket) return undefined;
    socket.emit("join-expo", id);
    socket.on("expo-updated", reload);
    return () => socket.off("expo-updated", reload);
  }, [socket, id]); // eslint-disable-line

  const register = async () => {
    try { await api.post(`/api/expos/${id}/register`); setM({ ok: "You are registered for this expo!" }); }
    catch (e) { setM({ error: errMsg(e) }); }
  };

  if (error) return <Msg error={error} />;
  if (!expo) return <p>Loading…</p>;
  const mode = isStaff(user) ? "admin" : user?.role === "exhibitor" ? "exhibitor" : "view";

  return (
    <>
      <div className="hero">
        <h1>{expo.title}</h1>
        <p>{new Date(expo.startDate).toLocaleDateString()} – {new Date(expo.endDate).toLocaleDateString()} · {expo.location}{expo.theme ? ` · Theme: ${expo.theme}` : ""}</p>
        {expo.description && <p>{expo.description}</p>}
        <div className="row">
          {user?.role === "attendee" && <button className="btn amber" onClick={register}>Register for this expo</button>}
          {expo.floorPlanImage && <button className="btn outline" onClick={() => document.getElementById("floorplan")?.scrollIntoView({ behavior: "smooth" })}>View floor plan</button>}
        </div>
        {!user && <p>Log in as an attendee to register.</p>}
      </div>
      <Msg {...m} />
      {expo.floorPlanImage && (
        <section className="card" id="floorplan">
          <div className="row">
            <h2 className="grow">Floor plan</h2>
            <a className="btn outline" href={expo.floorPlanImage} target="_blank" rel="noreferrer">Open full size</a>
          </div>
          {planFail ? (
            <p className="msg err">The floor plan image could not be loaded.</p>
          ) : (
            <a href={expo.floorPlanImage} target="_blank" rel="noreferrer">
              <img className="plan-img" src={expo.floorPlanImage} alt={`Floor plan of ${expo.title}`} onError={() => setPlanFail(true)} />
            </a>
          )}
        </section>
      )}
      <div className="tabs" role="tablist">
        {[["exhibitors", "Exhibitors"], ["schedule", "Schedule"], ["floor", "Floor plan"]].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`btn ${tab === k ? "" : "outline"}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === "exhibitors" && <ExhibitorSearch expoId={id} />}
      {tab === "schedule" && <Schedule expoId={id} />}
      {tab === "floor" && <FloorPlan expoId={id} mode={mode} />}
    </>
  );
}
