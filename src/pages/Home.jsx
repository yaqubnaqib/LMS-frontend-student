import { Form, Link, useLoaderData } from "react-router-dom";
import { listBooks } from "../api/library";
import BookCard from "../components/BookCard";
import Shelf from "../components/Shelf";
import { useAuth } from "../auth/AuthContext";
import useTitle from "../lib/useTitle";

export async function homeLoader({ request }) {
  try {
    const data = await listBooks({ pageSize: 9 }, request.signal);
    return { books: data.results || [], total: data.count || 0, offline: false };
  } catch {
    return { books: [], total: 0, offline: true };
  }
}

const STEPS = [
  { title: "Request it here", text: "Find the book in the catalog and press Request this book. One copy is set aside for you." },
  { title: "The library approves", text: "Staff check your request and give you a pick-up date and a return date." },
  { title: "Collect and return", text: "Pick the book up at the desk. My books counts down the days until it’s due." },
];

export default function Home() {
  const { books, total, offline } = useLoaderData();
  const { isAuthenticated } = useAuth();
  useTitle();

  return (
    <>
      <section className="hero">
        <div className="wrap hero__inner">
          <div className="hero__copy">
            <h1>Find a book, hold a copy, pick it up at the desk.</h1>
            <p className="hero__lede">
              Search {total > 0 ? `${total.toLocaleString()} titles` : "the library’s catalog"}, see how many copies are
              on the shelf right now, and request one before you walk over.
            </p>
            <Form action="/books" className="hero__search" role="search">
              <label htmlFor="hero-q" className="sr-only">Search by title, author or call number</label>
              <input
                id="hero-q"
                name="q"
                className="input"
                placeholder="Title, author or call number"
                autoComplete="off"
              />
              <button type="submit" className="btn btn--primary">Search</button>
            </Form>
            {offline && (
              <p className="hero__note" role="status">
                The catalog server isn’t responding right now, so the newest books can’t be shown.
              </p>
            )}
          </div>
          <div className="hero__shelf">
            <Shelf books={books} />
          </div>
        </div>
      </section>

      {books.length > 0 && (
        <section className="wrap section">
          <div className="section__head">
            <h2>New on the shelf</h2>
            <Link to="/books" className="section__more">See the whole catalog</Link>
          </div>
          <div className="book-grid book-grid--row">
            {books.slice(0, 8).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      <section className="wrap section">
        <div className="section__head">
          <h2>How a request works</h2>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step__n" aria-hidden="true">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        {!isAuthenticated && (
          <div className="cta">
            <p>You need a library account to request books.</p>
            <div className="cta__actions">
              <Link to="/signup" className="btn btn--primary">Create account</Link>
              <Link to="/login" className="btn btn--ghost">Sign in</Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
