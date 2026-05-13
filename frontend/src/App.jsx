import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import FindCourses from "./pages/FindCourses";
import CourseDetails from "./pages/CourseDetails";
import EnrollmentConfirmation from "./pages/EnrollmentConfirmation";
import MyCourses from "./pages/MyCourses";
import LessonView from "./pages/LessonView";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/admin/AdminEnrollments";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* All authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Shared routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/placeholder" element={<Placeholder />} />

          {/* Student routes (admin will just see dashboard if they navigate here) */}
          <Route path="/find-courses" element={<FindCourses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/enrollment-confirmation/:id" element={<EnrollmentConfirmation />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/lesson/:id" element={<LessonView />} />
          <Route path="/certificates" element={<Certificates />} />

          {/* Admin-only routes — hard guarded */}
          <Route element={<ProtectedRoute allowRole="admin" />}>
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
