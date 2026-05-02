import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import Layout from "./components/layout/Layout";
import Spinner from "./components/ui/Spinner";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import UserDetails from "./pages/admin/UserDetails";
import Cotisations from "./pages/admin/Cotisations";
import Archives from "./pages/admin/Archives";
import BlockedMembers from "./pages/admin/BlockedMembers";
import  Settings  from "./pages/admin/Settings";

// Membre
import MesCotisations from "./pages/membre/MesCotisations";
import Profile from "./pages/membre/Profile";

// Route protégée
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    // ✅ Redirection correcte selon le rôle réel
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/membre/cotisations"} replace />;
  }

  return children;
}
function DefaultRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const redirectPath =
    user.role === "admin"
      ? "/admin/dashboard"
      : "/membre/cotisations";

  return <Navigate to={redirectPath} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <SocketProvider>
                  <Layout />
                </SocketProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="cotisations" element={<Cotisations />} />
            <Route path="settings/general" element={<Settings />} />
            <Route path="settings/users" element={<Settings />} />
            <Route path="settings/archives" element={<Archives />} />
            <Route path="settings/bloques" element={<BlockedMembers />} />
          </Route>

          {/* Membre */}
          <Route
            path="/membre"
            element={
              <ProtectedRoute requiredRole="membre">
                <SocketProvider>
                  <Layout />
                </SocketProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="cotisations" replace />} />
            <Route path="cotisations" element={<MesCotisations />} />
            <Route path="profil" element={<Profile />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<DefaultRedirect />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}