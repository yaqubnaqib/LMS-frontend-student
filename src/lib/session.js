const KEY = "edulib.session";
const LEGACY_KEYS = ["token", "access", "userId", "username"];

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable: the session lasts for this tab only */
  }
  window.dispatchEvent(new Event("edulib:session"));
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("edulib:session"));
}
