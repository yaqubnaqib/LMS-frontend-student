import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { safeNext } from "../lib/nav";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

export function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  return isAuthenticated ? <Navigate to={safeNext(params.get("next"))} replace /> : children;
}
