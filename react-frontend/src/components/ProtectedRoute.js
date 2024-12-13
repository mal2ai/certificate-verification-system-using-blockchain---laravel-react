import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { Navigate } from "react-router-dom";
import { logout } from "utils/api";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  // If the user's role isn't allowed, show an alert and redirect
  if (allowedRoles && !Array.isArray(allowedRoles)) {
    console.error("allowedRoles must be an array");
    return <Navigate to="/sign-in" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    window.alert("You do not have permission to view this page.");

    // Redirect based on the userRole in localStorage
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else if (userRole === "user") {
      return <Navigate to="/status" />;
    }

    // Force logout and redirect to login page
    if (token) {
      logout(token)
        .then(() => {
          // Remove token and user role from localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("email");

          // Redirect to the login page after logout
          return <Navigate to="/sign-in" />;
        })
        .catch((error) => {
          console.error("Logout failed:", error);
          // Handle error if logout fails
        });
    }

    // Default redirect if no match (optional fallback)
    return <Navigate to="/sign-in" />;
  }

  // Render the protected content if the user is authenticated and has the correct role
  return children;
};

// Add prop types for validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

// Set default props
ProtectedRoute.defaultProps = {
  allowedRoles: [],
};

export default ProtectedRoute;
