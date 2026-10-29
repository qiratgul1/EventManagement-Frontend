import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Expos from "./pages/Expos";
import ExpoDetail from "./pages/ExpoDetail";
import Feedback from "./pages/Feedback";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Account from "./pages/Account";
import MyAgenda from "./pages/MyAgenda";
import ExhibitorProfile from "./pages/ExhibitorProfile";
import ExhibitorApplications from "./pages/ExhibitorApplications";
import ExhibitorBooths from "./pages/ExhibitorBooths";
import AdminDashboard from "./pages/AdminDashboard";
import AdminExpos from "./pages/AdminExpos";
import AdminApplications from "./pages/AdminApplications";
import AdminBooths from "./pages/AdminBooths";
import AdminSchedule from "./pages/AdminSchedule";
import AdminReports from "./pages/AdminReports";
import AdminFeedback from "./pages/AdminFeedback";

const P = (roles, el) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="expos" element={<Expos />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="expos/:id" element={<ExpoDetail />} />
        <Route path="feedback" element={<Feedback />} />

        <Route path="messages" element={P(null, <Messages />)} />
        <Route path="messages/:userId" element={P(null, <Messages />)} />
        <Route path="notifications" element={P(null, <Notifications />)} />
        <Route path="account" element={P(null, <Account />)} />

        <Route path="agenda" element={P(["attendee"], <MyAgenda />)} />

        <Route path="exhibitor/profile" element={P(["exhibitor"], <ExhibitorProfile />)} />
        <Route path="exhibitor/applications" element={P(["exhibitor"], <ExhibitorApplications />)} />
        <Route path="exhibitor/booths" element={P(["exhibitor"], <ExhibitorBooths />)} />

        <Route path="admin" element={P(["admin"], <AdminDashboard />)} />
        <Route path="admin/expos" element={P(["admin"], <AdminExpos />)} />
        <Route path="admin/applications" element={P(["admin"], <AdminApplications />)} />
        <Route path="admin/booths" element={P(["admin"], <AdminBooths />)} />
        <Route path="admin/schedule" element={P(["admin"], <AdminSchedule />)} />
        <Route path="admin/reports" element={P(["admin"], <AdminReports />)} />
        <Route path="admin/feedback" element={P(["admin"], <AdminFeedback />)} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
