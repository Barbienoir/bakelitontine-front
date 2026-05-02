import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";

// ProtectedRoute - Redirection vers login si non connecté
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// AdminRoute - Redirection vers membres si pas admin
export function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === "admin" ? children : <Navigate to="/membre/cotisations" replace />;
}

// MemberRoute - Redirection vers admin si admin
export function MemberRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === "membre" ? children : <Navigate to="/admin/dashboard" replace />;
}

// PublicRoute - Redirection vers dashboard si connecté
export function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/membre/cotisations"} replace />;
  }
  return children;
}