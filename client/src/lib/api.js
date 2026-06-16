import axios from "axios";

export function resolveApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_URL || "").trim();
  if (!configured) return "http://localhost:5000/api";

  const normalized = configured.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export default api;

