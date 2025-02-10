import { Navigate } from "react-router-dom";

const RedirectToDashboard = () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/sign-in" />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" />;
  } else if (userRole === "user") {
    return <Navigate to="/status" />;
  }

  return <Navigate to="/sign-in" />;
};

export default RedirectToDashboard;
