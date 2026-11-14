import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../auth/AuthContext";
import { initials } from "../lib/books";

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const onDown = (e) => {
      if (!accountRef.current?.contains(e.target)) setAccountOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setAccountOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username : "";
  const links = [
    { to: "/books", label: "Catalog" },
    ...(isAuthenticated ? [{ to: "/bookings", label: "My books" }] : []),
  ];

  return (
    <header className="nav">
      <div className="wrap nav__bar">
        <Logo />
        <nav aria-label="Main">
          <ul className="nav__links">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className="nav__link">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__end">
          {isAuthenticated ? (
            <div className="account" ref={accountRef}>
              <button
                type="button"
                className="account__trigger"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                <span className="avatar">{initials(user)}</span>
                {user?.firstName || user?.username}
              </button>
              {accountOpen && (
                <div className="account__menu" role="menu">
                  <div className="account__who">
                    <strong>{displayName}</strong>@{user?.username}
                  </div>
                  <Link to="/profile" role="menuitem">Profile</Link>
                  <Link to="/bookings" role="menuitem">My books</Link>
                  <button type="button" role="menuitem" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--quiet">Sign in</Link>
              <Link to="/signup" className="btn btn--primary">Create account</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            {menuOpen ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="nav__sheet" id="mobile-menu">
          <NavLink to="/" end>Home</NavLink>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
          ))}
          {isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
          <div className="nav__sheet-actions">
            {isAuthenticated ? (
              <button type="button" className="btn btn--ghost" onClick={handleSignOut}>
                Sign out
              </button>
            ) : (
              <>
                <Link to="/signup" className="btn btn--primary">Create account</Link>
                <Link to="/login" className="btn btn--ghost">Sign in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
