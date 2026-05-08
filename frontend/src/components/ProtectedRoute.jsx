import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-orange-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowRole && user.role !== allowRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
