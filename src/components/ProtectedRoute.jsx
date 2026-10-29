import { Navigate } from "react-router-dom";
import { isStaff, useAuth } from "../AuthContext";

// roles: ["admin"] | ["exhibitor"] | ["attendee"] | null (any logged-in user). organizer counts as admin.
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  const role = isStaff(user) ? "admin" : user.role;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}
