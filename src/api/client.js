import { clearSession, getSession, setSession } from "../lib/session";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/** Turn a DRF error body into one readable sentence. */
function messageFrom(data, status) {
  if (!data) return status >= 500 ? "The library server had a problem. Try again in a minute." : "Something went wrong.";
  if (typeof data === "string") return data;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === "string") return first;
  return "Something went wrong.";
}

let refreshing = null;

async function refreshAccess() {
  const session = getSession();
  if (!session?.refresh) return false;
  refreshing ??= fetch(`${API_BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.refresh }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const { access, refresh } = await res.json();
      setSession({ ...getSession(), access, refresh: refresh || session.refresh });
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api(path, { method = "GET", body, auth = false, signal } = {}, retried = false) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const session = getSession();
  if (auth && session?.access) headers.Authorization = `Bearer ${session.access}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("Can't reach the library server. Check your connection and try again.", 0);
  }

  if (res.status === 401 && auth && !retried) {
    if (await refreshAccess()) return api(path, { method, body, auth, signal }, true);
    clearSession();
    throw new ApiError("Your session ended. Sign in again to continue.", 401);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(messageFrom(data, res.status), res.status, data);
  return data;
}

/** Absolute URL for an uploaded file (book cover). */
export function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
