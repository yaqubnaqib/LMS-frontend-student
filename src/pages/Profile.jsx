import { Link, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { getMe } from "../api/library";
import { useAuth } from "../auth/AuthContext";
import { formatDate, initials } from "../lib/books";
import { getSession } from "../lib/session";
import useTitle from "../lib/useTitle";

export async function profileLoader({ request }) {
  if (!getSession()?.access) return redirect("/login?next=/profile");
  try {
    return { me: await getMe(request.signal) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return redirect("/login?next=/profile");
    throw err;
  }
}

export default function Profile() {
  const { me } = useLoaderData();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const fullName = [me.first_name, me.last_name].filter(Boolean).join(" ") || me.username;
  useTitle("Profile");

  return (
    <div className="wrap profile">
      <section className="card-id">
        <div className="card-id__top">
          <span className="avatar avatar--lg">{initials(me)}</span>
          <div>
            <h1>{fullName}</h1>
            <p>@{me.username}</p>
          </div>
        </div>

        <dl className="card-id__facts">
          <div>
            <dt>Email</dt>
            <dd>{me.email || "Not set"}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{formatDate(me.date_joined, { month: "long", year: "numeric" })}</dd>
          </div>
          <div>
            <dt>Library card no.</dt>
            <dd><span className="callno">{String(me.id).padStart(6, "0")}</span></dd>
          </div>
        </dl>
      </section>

      <section className="tally" aria-label="Your books">
        <Link to="/bookings" className="tally__item">
          <strong>{me.booked_count}</strong>
          <span>{me.booked_count === 1 ? "book on loan" : "books on loan"}</span>
        </Link>
        <Link to="/bookings" className="tally__item">
          <strong>{me.pending_count}</strong>
          <span>{me.pending_count === 1 ? "request waiting" : "requests waiting"}</span>
        </Link>
      </section>

      <div className="profile__actions">
        <Link to="/books" className="btn btn--primary">Search the catalog</Link>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            signOut();
            navigate("/");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
