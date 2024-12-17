import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import Loading from "components/Loading/loading";
import { getProfileDetails, logout } from "utils/api";

const ProtectedRoute = ({ children, allowedRoles, refreshTimeout = 300000 }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // `null` for initial loading state
  const [isRefreshing, setIsRefreshing] = useState(false); // To track if the page is refreshing
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  const refreshPage = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload(); // This will refresh the page
    }, 1000); // Delay to allow for state update before page reload
  };

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

    const timer = setInterval(() => {
      if (!isRefreshing) {
        refreshPage(); // Refresh the page after a certain timeout
      }
    }, refreshTimeout);

    // Cleanup the timer on component unmount
    return () => clearInterval(timer);
  }, [token, isRefreshing, refreshTimeout]);

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
  refreshTimeout: PropTypes.number, // Timeout duration in milliseconds
};

// Set default props
ProtectedRoute.defaultProps = {
  allowedRoles: [],
  refreshTimeout: 300000, // Default to 5 minutes (300,000 milliseconds)
};

export default ProtectedRoute;
