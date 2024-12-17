import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import Loading from "components/Loading/loading";
import { getProfileDetails, logout } from "utils/api";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // `null` for initial loading state
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        // Fetch user profile details
        const response = await getProfileDetails(token);
        const profileData = response?.data?.data;

        // Check if the user status is inactive or banned
        if (profileData?.status === "inactive" || profileData?.status === "banned") {
          // Clear localStorage and navigate to sign-in
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("email");
          setIsAuthorized(false);
        } else {
          // Allow access
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Assume unauthorized on error (e.g., invalid token)
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        setIsAuthorized(false);
      }
    };

    checkUserStatus();
  }, [token]);

  // While the authorization check is in progress
  if (isAuthorized === null) {
    return <Loading />;
  }

  // Redirect to sign-in if not authorized
  if (!isAuthorized) {
    return <Navigate to="/sign-in" />;
  }

  // Check role-based access
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
