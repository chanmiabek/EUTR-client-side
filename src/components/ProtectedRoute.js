import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { readStoredSession } from "../utils/adminSession";

function ProtectedRoute() {
  const location = useLocation();
  const session = typeof window !== "undefined" ? readStoredSession() : null;

  if (!session?.token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
