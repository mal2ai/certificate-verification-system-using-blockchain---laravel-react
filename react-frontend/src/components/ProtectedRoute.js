import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    return <Navigate to="/authentication/sign-in" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    window.alert("You do not have permission to view this page.");
    window.history.back(); // Go back to the previous page
    return null; // Prevent rendering anything else
  }

  return children;
};

// Add prop types for validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

// Set default props
ProtectedRoute.defaultProps = {
  allowedRoles: null,
};

export default ProtectedRoute;
