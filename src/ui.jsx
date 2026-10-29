import { useCallback, useEffect, useState } from "react";
import api, { errMsg } from "./api";

export const Msg = ({ error, ok }) =>
  error ? <div className="msg err" role="alert">{error}</div> : ok ? <div className="msg ok" role="status">{ok}</div> : null;

// <Field label="Name" value=.. onChange=.. />   as="select" | "textarea" supported
export const Field = ({ label, as: Tag = "input", children, ...props }) => (
  <div className="field">
    <label>
      {label}
      <Tag {...props}>{children}</Tag>
    </label>
  </div>
);

export const fmt = (d) => (d ? new Date(d).toLocaleString() : "");
export const toLocalInput = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
};
export const list = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);

// load data from the API:  const { data, error, loading, reload } = useLoad(async () => ..., [deps])
export function useLoad(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try { setLoading(true); setData(await fn()); setError(""); }
    catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}

// dropdown of all expos (used by admin / exhibitor pages)
export function ExpoSelect({ value, onChange, label = "Expo" }) {
  const { data } = useLoad(async () => (await api.get("/api/expos")).data.expos, []);
  useEffect(() => { if (data && data.length && !value) onChange(data[0]._id); }, [data]); // eslint-disable-line
  if (!data) return null;
  if (!data.length) return <p className="muted">No expos yet.</p>;
  return (
    <Field label={label} as="select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
      {data.map((x) => <option key={x._id} value={x._id}>{x.title}</option>)}
    </Field>
  );
}

// upload to Cloudinary through the backend, returns { url, name }
export async function uploadFile(file, folder = "general") {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post(`/api/upload?folder=${folder}`, fd);
  return data;
}

export const statusChip = (s) => (
  <span className={`chip ${s === "pending" || s === "reserved" ? "amber" : s === "rejected" ? "red" : ""}`}>{s}</span>
);
