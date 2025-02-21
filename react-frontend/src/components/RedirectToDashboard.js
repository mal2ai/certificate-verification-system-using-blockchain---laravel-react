import { Navigate, useLocation } from "react-router-dom";

const RedirectToDashboard = () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  // Allow the Landing page ("/") without redirecting
  if (location.pathname === "/") {
    return null; // Do nothing, show Landing page
  }

  // Redirect only if user is on "/sign-in" and already authenticated
  if (token) {
    if (location.pathname === "/sign-in") {
      if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === "user") {
        return <Navigate to="/status" replace />;
      }
    }
  }

  return null; // Otherwise, don't redirect
};

export default RedirectToDashboard;
