import { Link } from "react-router-dom";
import Logo from "./Logo";

// Split layout used by Login, Register, ForgotPassword and ResetPassword
export default function AuthShell({ children }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-art">
        <span className="orb o1" />
        <span className="orb o2" />
        <Link to="/" aria-label="Golden Hour, home"><Logo size="lg" /></Link>
        <h2>Every expo has its golden hour.</h2>
        <ul>
          <li>Discover expos and book sessions in seconds</li>
          <li>Reserve booths and meet exhibitors live</li>
          <li>Real-time updates, chat and notifications</li>
        </ul>
      </aside>
      <main className="auth-card card">{children}</main>
    </div>
  );
}
