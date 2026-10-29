import { useState } from "react";
import api, { errMsg } from "../api";
import { ExpoSelect, Field, Msg, list, useLoad } from "../ui";
import FloorPlan from "../components/FloorPlan";

const empty = { boothNumber: "", size: "3x3", location: "Hall A", price: "", features: "", x: "", y: "", w: "", h: "" };

export default function AdminBooths() {
  const [expoId, setExpoId] = useState("");
  const [f, setF] = useState(empty);
  const [ver, setVer] = useState(0);
  const [m, setM] = useState({});
  const expos = useLoad(async () => (await api.get("/api/expos")).data.expos, []);
  const image = expos.data?.find((x) => x._id === expoId)?.floorPlanImage;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    const pos = ["x", "y", "w", "h"].every((k) => f[k] !== "") ? { x: +f.x, y: +f.y, w: +f.w, h: +f.h } : undefined;
    try {
      await api.post("/api/booths", { expoId, boothNumber: f.boothNumber, size: f.size, location: f.location, price: +f.price, features: list(f.features), position: pos });
      setM({ ok: `Booth ${f.boothNumber} created` }); setF({ ...empty, location: f.location, size: f.size }); setVer((v) => v + 1);
    } catch (err) { setM({ error: errMsg(err) }); }
  };

  return (
    <>
      <h1>Booth allocation</h1>
      <ExpoSelect value={expoId} onChange={setExpoId} />
      {expoId && (
        <>
          <form className="card" onSubmit={create}>
            <h2>Add booth</h2>
            <Msg {...m} />
            <div className="row">
              <div className="grow"><Field label="Booth number" value={f.boothNumber} onChange={set("boothNumber")} required /></div>
              <div className="grow"><Field label="Size" value={f.size} onChange={set("size")} required /></div>
              <div className="grow"><Field label="Location / hall" value={f.location} onChange={set("location")} required /></div>
              <div className="grow"><Field label="Price ($)" type="number" min="0" value={f.price} onChange={set("price")} required /></div>
            </div>
            <Field label="Features (comma separated)" value={f.features} onChange={set("features")} placeholder="WiFi, Power" />
            <div className="row">
              {["x", "y", "w", "h"].map((k) => <div className="grow" key={k}><Field label={`Floor plan ${k} (optional)`} type="number" value={f[k]} onChange={set(k)} /></div>)}
            </div>
            <button className="btn">Add booth</button>
          </form>
          <FloorPlan key={`${expoId}-${ver}`} expoId={expoId} mode="admin" image={image} />
        </>
      )}
    </>
  );
}
