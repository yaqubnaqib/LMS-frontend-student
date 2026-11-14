import { Link } from "react-router-dom";
import { clothFor, hashString } from "../lib/books";

const PLACEHOLDERS = Array.from({ length: 9 }, (_, i) => ({ id: `p${i}`, title: `shelf-${i}`, author: "" }));

/** Books standing on a shelf, spine out. Each spine links to its book. */
export default function Shelf({ books }) {
  const items = books?.length ? books.slice(0, 9) : PLACEHOLDERS;
  const real = Boolean(books?.length);

  return (
    <div className="shelf" aria-label={real ? "Newest books on the shelf" : undefined}>
      <div className="shelf__row">
        {items.map((book, i) => {
          const h = hashString(`${book.title}${i}`);
          const style = {
            "--spine": clothFor(book),
            "--h": `${78 + (h % 22)}%`,
            "--w": `${44 + (h % 4) * 6}px`,
          };
          const lean = i === items.length - 1 && items.length > 5;
          const inner = (
            <>
              <span className="spine__band" />
              {real && <span className="spine__title">{book.title}</span>}
              <span className="spine__band spine__band--low" />
              {real && book.book_code && <span className="spine__label">{book.book_code}</span>}
            </>
          );
          return real ? (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className={`spine${lean ? " spine--lean" : ""}`}
              style={style}
              title={`${book.title} by ${book.author}`}
            >
              {inner}
            </Link>
          ) : (
            <span key={book.id} className={`spine${lean ? " spine--lean" : ""}`} style={style} aria-hidden="true">
              {inner}
            </span>
          );
        })}
      </div>
      <div className="shelf__board" />
    </div>
  );
}
