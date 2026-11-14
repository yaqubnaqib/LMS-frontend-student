import { Link, useLocation } from "react-router-dom";

function pageList(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push(`gap${p}`);
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages }) {
  const { pathname, search } = useLocation();
  if (totalPages <= 1) return null;

  const hrefFor = (p) => {
    const q = new URLSearchParams(search);
    if (p === 1) q.delete("page");
    else q.set("page", String(p));
    const s = q.toString();
    return `${pathname}${s ? `?${s}` : ""}`;
  };

  return (
    <nav className="pager" aria-label="Pages">
      <Link className="pager__item" to={hrefFor(page - 1)} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : 0}>
        Previous
      </Link>
      {pageList(page, totalPages).map((p) =>
        typeof p === "string" ? (
          <span key={p} className="pager__gap">…</span>
        ) : (
          <Link
            key={p}
            className="pager__item"
            to={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </Link>
        )
      )}
      <Link
        className="pager__item"
        to={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : 0}
      >
        Next
      </Link>
    </nav>
  );
}
