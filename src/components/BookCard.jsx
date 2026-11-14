import { Link } from "react-router-dom";
import BookCover from "./BookCover";
import StatusBadge from "./StatusBadge";
import { availability } from "../lib/books";

export default function BookCard({ book }) {
  const status = availability(book);
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <BookCover book={book} />
      <div className="book-card__body">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        <div className="book-card__meta">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
      </div>
    </Link>
  );
}
