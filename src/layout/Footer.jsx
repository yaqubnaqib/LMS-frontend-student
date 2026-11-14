import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <Logo />
        <p>Request a book online, then collect it at the library desk.</p>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/books">Catalog</Link>
          <Link to="/bookings">My books</Link>
        </nav>
      </div>
    </footer>
  );
}
