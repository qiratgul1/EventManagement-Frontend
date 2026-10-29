import axios from "axios";

// Local backend by default: http://localhost:<VITE_API_PORT>  (default port 5000)
// After deployment set VITE_API_URL to the full backend URL instead.
const PORT = import.meta.env.VITE_API_PORT || 5000;
export const BASE = (import.meta.env.VITE_API_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

const api = axios.create({ baseURL: BASE });

// attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong";

export default api;
