import { Link } from "react-router-dom";
import { isStaff, useAuth } from "../AuthContext";
import Logo from "./Logo";

export default function Footer() {
  const { user } = useAuth();
  const explore = [["/", "Home"], ["/expos", "Browse expos"], ["/about", "About"], ["/contact", "Contact"], ["/feedback", "Feedback"]];
  const account = user
    ? [["/messages", "Messages"], ["/notifications", "Notifications"], ["/account", "My account"]]
    : [["/login", "Log in"], ["/register", "Create account"], ["/forgot-password", "Forgot password"]];
  const team = isStaff(user)
    ? [["/admin", "Dashboard"], ["/admin/reports", "Reports"]]
    : user?.role === "exhibitor"
      ? [["/exhibitor/booths", "My booths"], ["/exhibitor/applications", "Applications"]]
      : [["/register", "Exhibit with us"], ["/register", "Organize an expo"]];

  const column = (title, links) => (
    <nav aria-label={title}>
      <h3>{title}</h3>
      {links.map(([to, label]) => <Link key={label} to={to}>{label}</Link>)}
    </nav>
  );

  return (
    <footer className="footer">
      <svg className="footer-wave" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="footerWave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset=".5" stopColor="#C026D3" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <path d="M0 20 C 180 40, 360 0, 540 20 S 900 40, 1080 20 S 1320 0, 1440 20" fill="none" stroke="url(#footerWave)" strokeWidth="2" />
      </svg>
      <div className="footer-grid">
        <div>
          <Logo size="md" />
          <p className="muted" style={{ marginTop: 12, maxWidth: 280 }}>Where every expo meets its golden hour: discover, connect and grow.</p>
        </div>
        {column("Explore", explore)}
        {column(user ? "Your space" : "Join", account)}
        {column(isStaff(user) ? "Organizers" : user?.role === "exhibitor" ? "Exhibitors" : "For teams", team)}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Golden Hour. All rights reserved.</span>
        <span className="live"><i className="pulse" /> Live &amp; glowing</span>
      </div>
    </footer>
  );
}
