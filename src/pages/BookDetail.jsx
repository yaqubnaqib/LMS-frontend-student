import { Link, redirect, useFetcher, useLoaderData, useLocation } from "react-router-dom";
import { ApiError } from "../api/client";
import { bookingsForBook, getBook, requestBook } from "../api/library";
import BookCover from "../components/BookCover";
import StatusBadge from "../components/StatusBadge";
import { availability, copiesOf, formatDate } from "../lib/books";
import { getSession } from "../lib/session";
import useTitle from "../lib/useTitle";

export async function bookLoader({ params, request }) {
  let book;
  try {
    book = await getBook(params.id, request.signal);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new Response("Not found", { status: 404 });
    }
    throw err;
  }
  let myBooking = null;
  if (getSession()?.access) {
    try {
      const mine = await bookingsForBook(params.id, request.signal);
      myBooking = mine.find((b) => b.isPending || b.isBooked) || null;
    } catch {
      /* not fatal: the page still shows the book */
    }
  }
  return { book, myBooking };
}

export async function bookAction({ params, request }) {
  if (!getSession()?.access) {
    return redirect(`/login?next=${encodeURIComponent(new URL(request.url).pathname)}`);
  }
  try {
    await requestBook(params.id);
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return redirect(`/login?next=${encodeURIComponent(new URL(request.url).pathname)}`);
    }
    return { ok: false, error: err.message };
  }
}

function HoldPanel({ book, myBooking }) {
  const fetcher = useFetcher();
  const location = useLocation();
  const signedIn = Boolean(getSession()?.access);
  const copies = copiesOf(book);
  const sending = fetcher.state !== "idle";
  const error = fetcher.data?.ok === false ? fetcher.data.error : null;

  if (myBooking?.isBooked) {
    return (
      <div className="hold hold--mine">
        <StatusBadge tone="ok">On loan to you</StatusBadge>
        <p>
          {myBooking.deadline_date
            ? `Return it by ${formatDate(myBooking.deadline_date)}.`
            : "The library approved your request."}
        </p>
        <Link to="/bookings" className="btn btn--ghost btn--block">See my books</Link>
      </div>
    );
  }

  if (myBooking?.isPending) {
    return (
      <div className="hold hold--mine">
        <StatusBadge tone="wait">Request sent</StatusBadge>
        <p>A copy is set aside for you. The library will confirm when it’s ready to collect.</p>
        <Link to="/bookings" className="btn btn--ghost btn--block">See my books</Link>
      </div>
    );
  }

  return (
    <div className="hold">
      <p className="hold__count">
        <strong>{copies}</strong> {copies === 1 ? "copy" : "copies"} on the shelf
      </p>
      {copies < 1 ? (
        <button type="button" className="btn btn--primary btn--block" disabled>
          No copies free
        </button>
      ) : signedIn ? (
        <fetcher.Form method="post">
          <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
            {sending ? "Sending request…" : "Request this book"}
          </button>
        </fetcher.Form>
      ) : (
        <Link
          to={`/login?next=${encodeURIComponent(location.pathname)}`}
          className="btn btn--primary btn--block"
        >
          Sign in to request
        </Link>
      )}
      {error && <p className="alert alert--error" role="alert">{error}</p>}
      <p className="hold__note">
        {copies < 1
          ? "Every copy is out. Check back when one is returned."
          : "Requesting sets one copy aside. Collect it at the desk once the library approves."}
      </p>
    </div>
  );
}

export default function BookDetail() {
  const { book, myBooking } = useLoaderData();
  const status = availability(book);
  useTitle(book.title);

  const details = [
    ["Subject", book.category_name || book.genre],
    ["Genre", book.category_name && book.genre !== book.category_name ? book.genre : null],
    ["Publisher", book.publisher],
    ["Published in", book.published_place],
    ["Publication date", formatDate(book.publication_date)],
    ["Pages", book.page_number],
    ["Dewey number", book.dewey_decimal_number],
    ["Dewey range", book.dewey_decimal_category_range],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "");

  return (
    <div className="wrap book">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/books">Catalog</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{book.title}</span>
      </nav>

      <div className="book__layout">
        <div className="book__cover">
          <BookCover book={book} size="lg" eager />
        </div>

        <div className="book__main">
          <div className="book__heading">
            {book.book_code && <span className="callno" title="Call number">{book.book_code}</span>}
            <h1>{book.title}</h1>
            <p className="book__author">by {book.author}</p>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          </div>

          <dl className="book__details">
            {details.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="book__aside" aria-label="Request this book">
          <HoldPanel book={book} myBooking={myBooking} />
        </aside>
      </div>
    </div>
  );
}
