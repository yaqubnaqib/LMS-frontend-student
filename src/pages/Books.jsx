import { useEffect, useRef } from "react";
import { Form, Link, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { PAGE_SIZE, listBooks, listCategories } from "../api/library";
import BookCard from "../components/BookCard";
import Pagination from "../components/Pagination";
import useTitle from "../lib/useTitle";

export async function booksLoader({ request }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const category = url.searchParams.get("category") || "";
  const availability = url.searchParams.get("availability") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page"), 10) || 1);

  const [booksRes, catsRes] = await Promise.allSettled([
    listBooks({ search: q, category, availability, page }, request.signal),
    listCategories(request.signal),
  ]);

  const books = booksRes.status === "fulfilled" ? booksRes.value : { count: 0, results: [] };
  return {
    q,
    category,
    availability,
    page,
    books: books.results || [],
    count: books.count || 0,
    categories: catsRes.status === "fulfilled" ? catsRes.value : [],
    error: booksRes.status === "rejected" ? booksRes.reason?.message || "The catalog didn’t load." : null,
  };
}

export default function Books() {
  const { q, category, availability, page, books, count, categories, error } = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const formRef = useRef(null);
  const searching = navigation.state === "loading" && navigation.location?.pathname === "/books";
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const filtered = Boolean(q || category || availability);
  useTitle(q ? `“${q}” in the catalog` : "Catalog");

  // Keep the inputs in sync when the URL changes (back/forward).
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.elements.q.value = q;
    form.elements.category.value = category;
    form.elements.availability.value = availability;
  }, [q, category, availability]);

  const autoSubmit = (e) => submit(e.currentTarget.form, { replace: true });

  return (
    <div className="wrap catalog">
      <header className="page-head">
        <h1>Catalog</h1>
        <p>Search by title, author, publisher or call number. Open a book to request a copy.</p>
      </header>

      <Form ref={formRef} method="get" className="filters" role="search">
        <div className="filters__search">
          <label htmlFor="q" className="sr-only">Search the catalog</label>
          <input
            id="q"
            name="q"
            type="search"
            className="input"
            defaultValue={q}
            placeholder="Title, author or call number"
            autoComplete="off"
          />
          <button type="submit" className="btn btn--primary">Search</button>
        </div>
        <div className="filters__row">
          <div className="field">
            <label htmlFor="category">Subject</label>
            <select id="category" name="category" className="select" defaultValue={category} onChange={autoSubmit}>
              <option value="">All subjects</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              name="availability"
              className="select"
              defaultValue={availability}
              onChange={autoSubmit}
            >
              <option value="">Any</option>
              <option value="available">Copies free now</option>
              <option value="out">All copies out</option>
            </select>
          </div>
        </div>
      </Form>

      <div className="catalog__status" aria-live="polite">
        {!error && (
          <p>
            {count === 0
              ? "No books found"
              : `${count.toLocaleString()} ${count === 1 ? "book" : "books"}${q ? ` for “${q}”` : ""}`}
            {totalPages > 1 && ` · page ${page} of ${totalPages}`}
          </p>
        )}
        {filtered && (
          <Link to="/books" className="btn btn--quiet">Clear search</Link>
        )}
      </div>

      <div className={searching ? "is-loading" : undefined}>
        {error ? (
          <div className="empty">
            <h2>The catalog didn’t load</h2>
            <p>{error}</p>
            <Link to="." reloadDocument className="btn btn--primary">Try again</Link>
          </div>
        ) : books.length === 0 ? (
          <div className="empty">
            <h2>{filtered ? "Nothing matches that search" : "The catalog is empty"}</h2>
            <p>
              {filtered
                ? "Check the spelling, try the author’s surname, or clear the filters."
                : "Books appear here as soon as library staff add them."}
            </p>
            {filtered && <Link to="/books" className="btn btn--ghost">Clear search</Link>}
          </div>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
