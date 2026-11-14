import { Link, redirect, useFetcher, useLoaderData } from "react-router-dom";
import { ApiError } from "../api/client";
import { cancelBooking, listMyBookings } from "../api/library";
import BookCover from "../components/BookCover";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../lib/books";
import { getSession } from "../lib/session";
import useTitle from "../lib/useTitle";

export async function bookingsLoader({ request }) {
  if (!getSession()?.access) return redirect("/login?next=/bookings");
  try {
    return { bookings: await listMyBookings(request.signal) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return redirect("/login?next=/bookings");
    return { bookings: [], error: err.message };
  }
}

export async function bookingsAction({ request }) {
  const form = await request.formData();
  try {
    await cancelBooking(form.get("id"));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const DAY = 24 * 60 * 60 * 1000;

function loanProgress(b) {
  if (!b.booking_date || !b.deadline_date) return null;
  const start = new Date(b.booking_date).getTime();
  const end = new Date(b.deadline_date).getTime();
  const now = Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const daysLeft = Math.ceil((end - now) / DAY);
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  return { daysLeft, pct, notStarted: now < start };
}

function statusOf(b) {
  if (b.isBooked) {
    const p = loanProgress(b);
    if (p && p.daysLeft < 0) return { tone: "stop", label: "Overdue" };
    return { tone: "ok", label: "On loan" };
  }
  return { tone: "wait", label: "Waiting for approval" };
}

function BookingRow({ booking }) {
  const fetcher = useFetcher();
  const status = statusOf(booking);
  const progress = booking.isBooked ? loanProgress(booking) : null;
  const cancelling = fetcher.state !== "idle";

  return (
    <li className={`loan${cancelling ? " is-leaving" : ""}`}>
      <Link to={`/books/${booking.book.id}`} className="loan__cover" tabIndex={-1} aria-hidden="true">
        <BookCover book={booking.book} size="sm" />
      </Link>

      <div className="loan__body">
        <div className="loan__title">
          <h3>
            <Link to={`/books/${booking.book.id}`}>{booking.book.title}</Link>
          </h3>
          <p>{booking.book.author}</p>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>

        {booking.isBooked && (
          <div className="loan__dates">
            {booking.booking_date && (
              <span>Picked up <strong>{formatDate(booking.booking_date)}</strong></span>
            )}
            {booking.deadline_date && (
              <span>Due back <strong>{formatDate(booking.deadline_date)}</strong></span>
            )}
          </div>
        )}

        {progress && !progress.notStarted && (
          <div className="loan__clock">
            <div
              className={`meter${progress.daysLeft < 0 ? " meter--late" : progress.daysLeft <= 3 ? " meter--soon" : ""}`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress.pct)}
              aria-label="Loan period used"
            >
              <span style={{ width: `${progress.pct}%` }} />
            </div>
            <p>
              {progress.daysLeft < 0
                ? `${Math.abs(progress.daysLeft)} ${Math.abs(progress.daysLeft) === 1 ? "day" : "days"} overdue. Return it to the desk as soon as you can.`
                : progress.daysLeft === 0
                  ? "Due back today."
                  : `${progress.daysLeft} ${progress.daysLeft === 1 ? "day" : "days"} left`}
            </p>
          </div>
        )}

        {booking.isPending && (
          <p className="loan__note">A copy is set aside for you. The library will set your pick-up date.</p>
        )}
        {fetcher.data?.ok === false && <p className="alert alert--error" role="alert">{fetcher.data.error}</p>}
      </div>

      {booking.isPending && (
        <fetcher.Form
          method="post"
          className="loan__action"
          onSubmit={(e) => {
            if (!window.confirm(`Cancel your request for “${booking.book.title}”?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={booking.id} />
          <button type="submit" className="btn btn--danger" disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel request"}
          </button>
        </fetcher.Form>
      )}
    </li>
  );
}

export default function Bookings() {
  const { bookings, error } = useLoaderData();
  useTitle("My books");
  const loans = bookings.filter((b) => b.isBooked);
  const requests = bookings.filter((b) => !b.isBooked && b.isPending);

  return (
    <div className="wrap loans">
      <header className="page-head">
        <h1>My books</h1>
        <p>Books you have on loan and requests waiting for the library to approve.</p>
      </header>

      {error ? (
        <div className="empty">
          <h2>Your books didn’t load</h2>
          <p>{error}</p>
        </div>
      ) : loans.length + requests.length === 0 ? (
        <div className="empty">
          <h2>Nothing borrowed yet</h2>
          <p>Find a book in the catalog and press Request this book. It will show up here.</p>
          <Link to="/books" className="btn btn--primary">Search the catalog</Link>
        </div>
      ) : (
        <>
          {loans.length > 0 && (
            <section className="loans__group">
              <h2>On loan <span className="loans__count">{loans.length}</span></h2>
              <ul className="loan-list">
                {loans.map((b) => <BookingRow key={b.id} booking={b} />)}
              </ul>
            </section>
          )}
          {requests.length > 0 && (
            <section className="loans__group">
              <h2>Requested <span className="loans__count">{requests.length}</span></h2>
              <ul className="loan-list">
                {requests.map((b) => <BookingRow key={b.id} booking={b} />)}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
