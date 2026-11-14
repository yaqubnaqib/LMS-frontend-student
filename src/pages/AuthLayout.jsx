import Shelf from "../components/Shelf";

export default function AuthLayout({ title, intro, children }) {
  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__card">
          <h1>{title}</h1>
          <p className="auth__intro">{intro}</p>
          {children}
        </div>
      </div>
      <div className="auth__art" aria-hidden="true">
        <Shelf />
      </div>
    </div>
  );
}
