import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="EduLib home">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="2" y="5" width="5" height="18" rx="1" fill="#1e5a47" />
        <rect x="8.5" y="2" width="5" height="21" rx="1" fill="#6b2737" />
        <rect x="15" y="7" width="4.5" height="16" rx="1" fill="#23395b" transform="rotate(-12 17 15)" />
        <rect x="1" y="23" width="24" height="2" rx="1" fill="#18262b" />
        <rect x="8.5" y="18" width="5" height="2" fill="#b8913a" />
      </svg>
      EduLib
    </Link>
  );
}
