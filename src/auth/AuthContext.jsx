import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, getSession, setSession } from "../lib/session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setState] = useState(getSession);

  useEffect(() => {
    const sync = () => setState(getSession());
    window.addEventListener("edulib:session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("edulib:session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signIn = useCallback((data) => {
    setSession({
      access: data.access,
      refresh: data.refresh,
      user: {
        id: data.id,
        username: data.username,
        firstName: data.first_name || "",
        lastName: data.last_name || "",
      },
    });
  }, []);

  const signOut = useCallback(() => clearSession(), []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isAuthenticated: Boolean(session?.access), signIn, signOut }),
    [session, signIn, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
