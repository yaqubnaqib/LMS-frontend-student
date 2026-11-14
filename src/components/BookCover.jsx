import { useState } from "react";
import { mediaUrl } from "../api/client";
import { clothFor } from "../lib/books";

/** A book's cover photo, or a cloth-bound cover set from its title. */
export default function BookCover({ book, size = "md", eager = false }) {
  const src = book?.digital_image || mediaUrl(book?.cover_image);
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  // Shrink the title just enough that its longest word fits on one line.
  const longest = Math.max(4, ...String(book?.title || "").split(/\s+/).map((w) => w.length));
  const titleSize = `${Math.min(10.5, 70 / (longest * 0.58)).toFixed(2)}cqi`;

  return (
    <div className={`cover cover--${size}`} style={{ background: clothFor(book) }}>
      {showImage ? (
        <img
          src={src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cover__made" aria-hidden="true">
          <span className="cover__title" style={{ "--title-size": titleSize }}>{book?.title}</span>
          <span className="cover__rule" />
          <span className="cover__author">{book?.author}</span>
        </div>
      )}
    </div>
  );
}
