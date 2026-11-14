// Bookcloth colours for books that have no cover photo.
const CLOTHS = ["#1e5a47", "#6b2737", "#23395b", "#8a5a1f", "#2b6464", "#4e3a5e", "#3d4a2a", "#7a3b22"];

export function hashString(text = "") {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const clothFor = (book) => CLOTHS[hashString(`${book?.title}|${book?.author}`) % CLOTHS.length];

export function copiesOf(book) {
  if (typeof book?.copies_available === "number") return book.copies_available;
  const n = parseInt(book?.number_of_copies, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Availability of a book from the copies left on the shelf. */
export function availability(book) {
  const copies = copiesOf(book);
  if (copies > 0) {
    return { tone: "ok", label: copies === 1 ? "1 copy free" : `${copies} copies free` };
  }
  return { tone: "stop", label: "All copies out" };
}

export function formatDate(value, opts = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, opts);
}

export function initials(user) {
  const a = (user?.firstName || user?.first_name || "").trim();
  const b = (user?.lastName || user?.last_name || "").trim();
  const s = `${a[0] || ""}${b[0] || ""}` || (user?.username || "?").slice(0, 2);
  return s.toUpperCase();
}
