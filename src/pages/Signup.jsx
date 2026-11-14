import { Form, Link, redirect, useActionData, useNavigation, useSearchParams } from "react-router-dom";
import { signup } from "../api/library";
import AuthLayout from "./AuthLayout";
import useTitle from "../lib/useTitle";

export async function signupAction({ request }) {
  const form = await request.formData();
  const v = (k) => String(form.get(k) || "").trim();
  const values = {
    first_name: v("first_name"),
    last_name: v("last_name"),
    username: v("username"),
    email: v("email"),
  };
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm") || "");

  const errors = {};
  if (!values.first_name) errors.first_name = "Enter your first name.";
  if (!values.last_name) errors.last_name = "Enter your last name.";
  if (!/^[\w.@+-]{3,150}$/.test(values.username))
    errors.username = "Use 3 or more letters, numbers, or . @ + - _ (no spaces).";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter an email address like name@example.com.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (password !== confirm) errors.confirm = "The two passwords don’t match.";
  if (Object.keys(errors).length) return { errors, values };

  try {
    await signup({ ...values, password });
  } catch (err) {
    const fieldErrors = {};
    if (err.data && typeof err.data === "object") {
      for (const [k, msg] of Object.entries(err.data)) fieldErrors[k] = Array.isArray(msg) ? msg[0] : String(msg);
    }
    return { errors: fieldErrors, formError: Object.keys(fieldErrors).length ? null : err.message, values };
  }
  const next = new URL(request.url).searchParams.get("next");
  return redirect(`/login?joined=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}

function Field({ name, label, type = "text", autoComplete, hint, result }) {
  const error = result?.errors?.[name];
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="input"
        autoComplete={autoComplete}
        defaultValue={type === "password" ? undefined : result?.values?.[name]}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        required
      />
      {error ? (
        <span id={`${name}-error`} className="field__error">{error}</span>
      ) : (
        hint && <span id={`${name}-hint`} className="field__hint">{hint}</span>
      )}
    </div>
  );
}

export default function Signup() {
  const result = useActionData();
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const busy = navigation.state === "submitting";
  useTitle("Create account");

  return (
    <AuthLayout title="Create your library account" intro="It takes a minute. You’ll use it to request books and track loans.">
      {result?.formError && <p className="alert alert--error" role="alert">{result.formError}</p>}
      <Form method="post" className="auth__form" noValidate>
        <div className="auth__pair">
          <Field name="first_name" label="First name" autoComplete="given-name" result={result} />
          <Field name="last_name" label="Last name" autoComplete="family-name" result={result} />
        </div>
        <Field name="username" label="Username" autoComplete="username" result={result} />
        <Field name="email" label="Email" type="email" autoComplete="email" result={result} />
        <Field
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          result={result}
        />
        <Field name="confirm" label="Repeat password" type="password" autoComplete="new-password" result={result} />
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </Form>
      <p className="auth__switch">
        Already have an account? <Link to={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next"))}` : ""}`}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
