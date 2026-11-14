import { Outlet, ScrollRestoration, useNavigation } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppShell() {
  const navigation = useNavigation();
  return (
    <AuthProvider>
      <div className="app">
        <a href="#main" className="skip-link">Skip to content</a>
        {navigation.state !== "idle" && <div className="route-progress" aria-hidden="true" />}
        <Navbar />
        <main id="main" className="app__main">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ScrollRestoration />
    </AuthProvider>
  );
}
