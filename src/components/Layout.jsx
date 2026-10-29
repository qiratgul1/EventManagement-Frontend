import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { isStaff, useAuth } from "../AuthContext";
import Logo from "./Logo";
import Footer from "./Footer";

const LINKS = {
  guest: [["/", "Home"], ["/expos", "Expos"], ["/about", "About"], ["/contact", "Contact"]],
  attendee: [["/expos", "Expos"], ["/agenda", "My agenda"], ["/messages", "Messages"], ["/notifications", "Notifications"], ["/feedback", "Feedback"], ["/account", "Account"]],
  exhibitor: [["/expos", "Expos"], ["/exhibitor/profile", "Profile"], ["/exhibitor/applications", "Applications"], ["/exhibitor/booths", "My booths"], ["/messages", "Messages"], ["/notifications", "Notifications"], ["/account", "Account"]],
  admin: [["/admin", "Dashboard"], ["/admin/expos", "Expos"], ["/admin/applications", "Applications"], ["/admin/booths", "Booths"], ["/admin/schedule", "Schedule"], ["/admin/reports", "Reports"], ["/admin/feedback", "Feedback"], ["/messages", "Messages"], ["/notifications", "Notifications"], ["/account", "Account"]],
};

export default function Layout() {
  const { user, logout, unread } = useAuth();
  const navigate = useNavigate();
  const key = !user ? "guest" : isStaff(user) ? "admin" : user.role;
  const initials = user ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "";

  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brandlink" aria-label="Golden Hour, home"><Logo size="sm" tagline={false} /></Link>
          <nav className="dock" aria-label="Main">
            {LINKS[key].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/" || to === "/admin"} className={({ isActive }) => (isActive ? "active" : "")}>
                {label}
                {label === "Notifications" && unread > 0 && <span className="badge">{unread}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="userbox">
            {user ? (
              <>
                <span className="avatar" aria-hidden="true">{initials}</span>
                <span className="uname">{user.name}</span>
                <button className="btn outline sm" onClick={() => { logout(); navigate("/login"); }}>Log out</button>
              </>
            ) : (
              <>
                <Link className="btn outline sm" to="/login">Log in</Link>
                <Link className="btn sm" to="/register">Join</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="page"><Outlet /></main>
      <Footer />
    </div>
  );
}
