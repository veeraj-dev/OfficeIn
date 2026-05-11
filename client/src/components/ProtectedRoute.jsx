import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

export default function ProtectedRoute({ roles }) {
  const { loading, isAuthed, user } = useAuth();

  if (loading) return null;
  if (!isAuthed) return <Navigate to="/" replace />;
  if (roles && roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

