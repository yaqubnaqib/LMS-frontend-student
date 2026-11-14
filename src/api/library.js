import { api } from "./client";

export const PAGE_SIZE = 12;

export function listBooks({ search, category, availability, page = 1, pageSize = PAGE_SIZE } = {}, signal) {
  const q = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search) q.set("search", search);
  if (category) q.set("category", category);
  if (availability === "available") q.set("is_booked", "false");
  if (availability === "out") q.set("is_booked", "true");
  return api(`/api/books/?${q}`, { signal });
}

export const getBook = (id, signal) => api(`/api/books/${id}/`, { signal });
export const listCategories = (signal) => api("/api/categories/", { signal });

export const login = (username, password) =>
  api("/api/login/", { method: "POST", body: { username, password } });
export const signup = (payload) => api("/api/signup/", { method: "POST", body: payload });
export const getMe = (signal) => api("/api/me/", { auth: true, signal });

export const listMyBookings = (signal) => api("/api/booking/", { auth: true, signal });
export const bookingsForBook = (bookId, signal) =>
  api(`/api/booking/?book_id=${encodeURIComponent(bookId)}`, { auth: true, signal });
export const requestBook = (bookId) =>
  api("/api/booking/", { method: "POST", auth: true, body: { book: { id: Number(bookId) } } });
export const cancelBooking = (bookingId) =>
  api(`/api/booking/${bookingId}/`, { method: "DELETE", auth: true });
