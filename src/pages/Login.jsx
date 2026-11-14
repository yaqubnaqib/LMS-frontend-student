import { useEffect } from "react";
import { Form, Link, useActionData, useNavigate, useNavigation, useSearchParams } from "react-router-dom";
import { login } from "../api/library";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "./AuthLayout";
import { safeNext } from "../lib/nav";
import useTitle from "../lib/useTitle";

export async function loginAction({ request }) {
  const form = await request.formData();
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  if (!username || !password) return { error: "Enter your username and password." };
  try {
    return { session: await login(username, password) };
  } catch (err) {
    return { error: err.message };
  }
}

export default function Login() {
  const result = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn } = useAuth();
  const busy = navigation.state === "submitting";
  const justJoined = params.get("joined") === "1";
  useTitle("Sign in");

  useEffect(() => {
    if (result?.session) {
      signIn(result.session);
      navigate(safeNext(params.get("next")), { replace: true });
    }
  }, [result, signIn, navigate, params]);

  return (
    <AuthLayout title="Sign in" intro="Use your library account to request books and see what you have on loan.">
      {justJoined && !result && (
        <p className="alert alert--success" role="status">Account created. Sign in to continue.</p>
      )}
      {result?.error && <p className="alert alert--error" role="alert">{result.error}</p>}
      <Form method="post" className="auth__form" noValidate>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" className="input" autoComplete="username" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </Form>
      <p className="auth__switch">
        New here? <Link to={`/signup${params.get("next") ? `?next=${encodeURIComponent(params.get("next"))}` : ""}`}>Create an account</Link>
      </p>
    </AuthLayout>
  );
}
