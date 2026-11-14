import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import Navbar from "../layout/Navbar";
import useTitle from "../lib/useTitle";

export function NotFound() {
  useTitle("Page not found");
  return (
    <div className="wrap error-page">
      <p className="callno">404</p>
      <h1>This page isn’t on the shelf.</h1>
      <p>The link may be old or mistyped. Search the catalog instead.</p>
      <div className="error-page__actions">
        <Link to="/books" className="btn btn--primary">Search the catalog</Link>
        <Link to="/" className="btn btn--ghost">Go home</Link>
      </div>
    </div>
  );
}

/** Error shown inside the app shell (navbar and footer stay). */
export function RouteError() {
  const error = useRouteError();
  useTitle("Something went wrong");
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return (
    <div className="wrap error-page">
      <h1>This page didn’t load.</h1>
      <p>{error?.message || "Reload the page to try again."}</p>
      <div className="error-page__actions">
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
        <Link to="/" className="btn btn--ghost">Go home</Link>
      </div>
    </div>
  );
}

/** Last-resort error page when the shell itself fails. */
export default function ErrorPage() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="app__main">
          <RouteError />
        </main>
      </div>
    </AuthProvider>
  );
}
