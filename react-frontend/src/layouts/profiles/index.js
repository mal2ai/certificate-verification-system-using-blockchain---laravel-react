import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress"; // For loading spinner

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// MDSnackbar component
import MDSnackbar from "components/MDSnackbar";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

// API functions
import {
  getProfileDetails,
  updateProfileDetails,
  changePassword,
  deleteAccount,
  QR2FA,
  enable2FA,
  disable2FA,
  getMFAStatus,
} from "utils/api";

function ProfileForm({ onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [accountType, setAccountType] = useState(""); // To store the account type (e.g., student, potential_employer, educational_institution)
  const [studentId, setStudentId] = useState(""); // To store the student ID
  const [companyName, setCompanyName] = useState(""); // To store the company name
  const [institutionName, setInstitutionName] = useState(""); // To store the institution name
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingName, setLoadingName] = useState(false); // Loading state for name input
  const [loadingEmail, setLoadingEmail] = useState(false); // Loading state for email input
  const [loadingRole, setLoadingRole] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false); // Loading state for password inputs
  const [token, setToken] = useState(null);
  const [isDeleteClicked, setIsDeleteClicked] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteCurrentPassword, setDeleteCurrentPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  //MFA state
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [google2faSecret, setGoogle2faSecret] = useState("");
  const [mfaCurrentPassword, setMFACurrentPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [mfaError, setMFAError] = useState("");

  // Notification state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState(""); // "success" or "error"

  const navigate = useNavigate();
  const location = useLocation();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Fetch MFA status on component mount
  useEffect(() => {
    const fetchMFAStatus = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, skipping MFA status fetch.");
        return;
      }

      try {
        const response = await getMFAStatus(token);
        setIs2FAEnabled(response.data.is_2fa_enabled);
        setGoogle2faSecret(response.data.google2fa_secret);
        console.log("MFA status:", response.data);
      } catch (error) {
        console.error("Error fetching MFA status:", error);
      }
    };

    // Fetch immediately on mount
    fetchMFAStatus();

    // Set interval to fetch every 10 seconds
    const interval = setInterval(() => {
      fetchMFAStatus();
    }, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleEnableMFA = async () => {
    try {
      const response = await QR2FA();
      console.log("API Response:", response.data);

      if (response.data.qr_code && typeof response.data.qr_code === "string") {
        setQrCode(response.data.qr_code);
        setSecret(response.data.secret);
      } else {
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error enabling MFA:", error);
    }
  };

  const handleVerifyMFA = async () => {
    try {
      if (!mfaCode || mfaCode.length !== 6) {
        alert("Please enter a valid 6-digit code.");
        return;
      }

      const response = await enable2FA(mfaCode);

      if (response.data.success) {
        setSnackbarMessage("MFA enabled successfully!");
        setSnackbarType("success");
        setOpenSnackbar(true);
        setIs2FAEnabled(true);
      } else {
        alert("Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying MFA:", error);
      alert(error.response?.data?.message || "Failed to verify MFA. Please try again.");
    }
  };

  const handleShowPasswordInput = () => {
    setShowPasswordInput(true);
  };

  const handleCancelDisableMFA = () => {
    setShowPasswordInput(false);
    setMFACurrentPassword("");
    setMFAError("");
  };

  const handleDisableMFA = async () => {
    const token = localStorage.getItem("token"); // Get the token first

    if (!token) {
      console.error("No token found, cannot disable MFA.");
      alert("Authentication error. Please log in again.");
      return;
    }

    if (!mfaCurrentPassword) {
      setMFAError("Please enter your current password.");
      return;
    }

    try {
      const response = await disable2FA(token, mfaCurrentPassword); // Pass password

      if (response.data.success) {
        setSnackbarMessage("MFA has been disabled.");
        setSnackbarType("success");
        setOpenSnackbar(true);
        setIs2FAEnabled(false);
        setQrCode("");
        setSecret("");
        setMFACurrentPassword("");
        setShowPasswordInput(false);
      } else {
        alert(response.data.message); // Show error message from API
      }
    } catch (error) {
      console.error("Error disabling MFA:", error);
      setMFAError(error.response?.data?.message || "An error occurred while disabling MFA.");
    }
  };

  // Handle success message if present in the location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarType("success");
      setOpenSnackbar(true);

      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  // Fetch token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  // Fetch user profile details when token is available
  useEffect(() => {
    if (token) {
      const fetchProfileDetails = async () => {
        try {
          setLoadingName(true);
          setLoadingEmail(true);
          setLoadingRole(true);
          setLoading(true);

          const response = await getProfileDetails(token);

          // Check if the response contains the correct data
          if (response && response.data && response.data.data) {
            const profileData = response.data.data;

            setName(profileData.name || "");
            setEmail(profileData.email || "");
            setRole(profileData.role || "");
            setAccountType(profileData.account_type || "");

            // Fetch additional fields based on account type
            if (profileData.account_type === "student") {
              setStudentId(profileData.student_id || "");
            } else if (profileData.account_type === "potential_employer") {
              setCompanyName(profileData.company_name || "");
            } else if (profileData.account_type === "educational_institution") {
              setInstitutionName(profileData.institution_name || "");
            }
          } else {
            console.error("Profile data is missing:", response);
          }
        } catch (error) {
          console.error("Error fetching profile details:", error);
        } finally {
          setLoadingName(false);
          setLoadingEmail(false);
          setLoadingRole(false);
          setLoading(false);
        }
      };

      fetchProfileDetails();
    }
  }, [token]);

  // Handle Profile Submit
  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (token) {
      try {
        setLoadingName(true);
        setLoadingEmail(true);

        // Transform the payload keys to match backend expectations
        const profileData = {
          name,
          email,
          account_type: accountType, // Match the backend key for account type
        };

        if (accountType === "student") {
          profileData.student_id = studentId; // Match backend key for student ID
        } else if (accountType === "potential_employer") {
          profileData.company_name = companyName; // Match backend key for company name
        } else if (accountType === "educational_institution") {
          profileData.institution_name = institutionName; // Match backend key for institution name
        }

        // Update profile details
        const response = await updateProfileDetails(profileData, token);

        // Check if response contains updated data
        if (response && response.data && response.data.data) {
          const updatedProfile = response.data.data;

          // Update the state with the new values
          setName(updatedProfile.name || "");
          setEmail(updatedProfile.email || "");
          setAccountType(updatedProfile.account_type || ""); // Use the correct backend key

          // Update based on account type
          setStudentId(updatedProfile.student_id || "");
          setCompanyName(updatedProfile.company_name || "");
          setInstitutionName(updatedProfile.institution_name || "");
        }

        setSnackbarMessage("Profile updated successfully!");
        setSnackbarType("success");
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error updating profile details:", error);
        setSnackbarMessage("Error updating profile details.");
        setSnackbarType("error");
        setOpenSnackbar(true);
      } finally {
        setLoadingName(false);
        setLoadingEmail(false);
      }
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match!");
      return;
    }
    if (token) {
      try {
        setLoadingPassword(true);
        await changePassword(
          {
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword,
          },
          token
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSnackbarMessage("Password updated successfully!");
        setSnackbarType("success");
        setOpenSnackbar(true);
      } catch (error) {
        setSnackbarMessage(error.response.data.message);
        setSnackbarType("error");
        setOpenSnackbar(true);
      } finally {
        setLoadingPassword(false);
      }
    }
  };

  // Handle Account Deletion
  const handleDeleteConfirmation = () => {
    setIsDeleteClicked(true); // Hide the "Delete Account" button and show input fields
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    setLoadingDelete(true);
    setDeleteError("");

    // Client-side validation for empty password
    if (!deleteCurrentPassword) {
      setDeleteError("Password cannot be empty.");
      setLoadingDelete(false);
      return;
    }

    try {
      // Data to be sent to the API (e.g., current password)
      const data = { current_password: deleteCurrentPassword };

      // Call the deleteAccount function with the data and token
      await deleteAccount(data, token);

      // On success, show a success message or handle accordingly
      alert("Your account has been successfully deleted.");

      // Remove user data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");

      // Redirect to the sign-in page
      navigate("/sign-in");

      // Optionally reset the form or redirect the user
      setIsDeleteClicked(false);
      setCurrentPassword(""); // Clear password field
    } catch (error) {
      // On error, show an error message
      if (error.response && error.response.data.success === false) {
        setDeleteError(error.response.data.message);
      } else {
        setDeleteError("Failed to delete your account. Please try again later.");
      }
      console.error("Error ", error);
    } finally {
      setLoadingDelete(false); // Stop the loading spinner
    }
  };

  const cancelDelete = () => {
    setIsDeleteClicked(false);
    setConfirmDelete(false);
    setDeleteCurrentPassword("");
    setDeleteError("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Card>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {/* Profile Information Section */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <MDBox>
                          <MDTypography variant="h5" fontWeight="medium">
                            Profile Information
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mt={1} mb={2}>
                            Update your account&#39;s profile information and email address.
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            <form onSubmit={handleProfileSubmit}>
                              <MDBox mb={3}>
                                <MDInput
                                  type="text"
                                  label="Account Type"
                                  name="account_type"
                                  value={accountType || ""}
                                  fullWidth
                                  InputProps={{
                                    readOnly: true,
                                    endAdornment: loadingEmail ? (
                                      <CircularProgress size={20} />
                                    ) : null,
                                  }}
                                />
                              </MDBox>

                              {/* Conditional Inputs Based on Account Type */}
                              {accountType === "student" && (
                                <MDBox mb={3}>
                                  <MDInput
                                    type="text"
                                    label="Student ID"
                                    name="student_id"
                                    value={studentId || ""}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    fullWidth
                                  />
                                </MDBox>
                              )}

                              {accountType === "potential_employer" && (
                                <MDBox mb={3}>
                                  <MDInput
                                    type="text"
                                    label="Company Name"
                                    name="company_name"
                                    value={companyName || ""}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    fullWidth
                                  />
                                </MDBox>
                              )}

                              {accountType === "educational_institution" && (
                                <MDBox mb={3}>
                                  <MDInput
                                    type="text"
                                    label="Institution Name"
                                    name="institution_name"
                                    value={institutionName || ""}
                                    onChange={(e) => setInstitutionName(e.target.value)}
                                    fullWidth
                                  />
                                </MDBox>
                              )}
                              <MDBox mb={3}>
                                <MDInput
                                  type="text"
                                  label="Full Name"
                                  name="name"
                                  value={name || ""}
                                  onChange={(e) => setName(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: loadingName ? (
                                      <CircularProgress size={20} />
                                    ) : null,
                                  }}
                                />
                              </MDBox>
                              <MDBox mb={3}>
                                <MDInput
                                  type="email"
                                  label="Email"
                                  name="email"
                                  value={email || ""}
                                  onChange={(e) => setEmail(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    readOnly: true,
                                    endAdornment: loadingEmail ? (
                                      <CircularProgress size={20} />
                                    ) : null,
                                  }}
                                />
                              </MDBox>
                              {role === "admin" && (
                                <MDBox mb={3}>
                                  <MDInput
                                    type="text"
                                    label="Role"
                                    name="role"
                                    value={role || ""}
                                    fullWidth
                                    InputProps={{
                                      readOnly: true,
                                      endAdornment: loadingRole ? (
                                        <CircularProgress size={20} />
                                      ) : null,
                                    }}
                                  />
                                </MDBox>
                              )}
                              <MDBox display="flex" justifyContent="flex-end">
                                <MDButton variant="gradient" color="dark" type="submit">
                                  Save
                                </MDButton>
                              </MDBox>
                            </form>
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                  </Grid>

                  {/* Update Password Section */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <MDBox>
                          <MDTypography variant="h5" fontWeight="medium">
                            Update Password
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mt={1} mb={2}>
                            Update your password. Be sure to choose a strong password.
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            {passwordError && ( // Conditionally render the error message
                              <MDTypography variant="body2" color="error" mb={2}>
                                {passwordError}
                              </MDTypography>
                            )}
                            <form onSubmit={handlePasswordSubmit}>
                              {/* Current Password */}
                              <MDBox mb={3}>
                                <MDInput
                                  type={showCurrentPassword ? "text" : "password"}
                                  label="Current Password"
                                  name="current_password"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {loadingPassword ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          <IconButton
                                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                                            edge="end"
                                          >
                                            {showCurrentPassword ? (
                                              <VisibilityOff />
                                            ) : (
                                              <Visibility />
                                            )}
                                          </IconButton>
                                        )}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </MDBox>

                              {/* New Password */}
                              <MDBox mb={3}>
                                <MDInput
                                  type={showNewPassword ? "text" : "password"}
                                  label="New Password"
                                  name="new_password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {loadingPassword ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          <IconButton
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            edge="end"
                                          >
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                        )}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </MDBox>

                              {/* Confirm Password */}
                              <MDBox mb={3}>
                                <MDInput
                                  type={showConfirmPassword ? "text" : "password"}
                                  label="Confirm Password"
                                  name="confirm_password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {loadingPassword ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          <IconButton
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            edge="end"
                                          >
                                            {showConfirmPassword ? (
                                              <VisibilityOff />
                                            ) : (
                                              <Visibility />
                                            )}
                                          </IconButton>
                                        )}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </MDBox>
                              <MDBox display="flex" justifyContent="flex-end">
                                <MDButton variant="gradient" color="dark" type="submit">
                                  Save
                                </MDButton>
                              </MDBox>
                            </form>
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                  </Grid>

                  {/* MFA Section */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <MDBox>
                          <MDTypography variant="h5" fontWeight="medium">
                            Multi-Factor Authentication (MFA)
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mt={1} mb={2}>
                            Enable MFA for strong account security.
                          </MDTypography>
                        </MDBox>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            {is2FAEnabled ? (
                              <>
                                <MDTypography variant="body2" color="text" mt={1} mb={2}>
                                  Your MFA is already{" "}
                                  <span style={{ fontWeight: "bold" }}>enabled</span>. Use this
                                  secret key for authentication:
                                </MDTypography>

                                <MDBox mb={2} display="flex" justifyContent="center" width="100%">
                                  <MDTypography
                                    variant="body2"
                                    sx={{
                                      backgroundColor: "#f5f5f5",
                                      width: "100%",
                                      padding: "8px",
                                      borderRadius: "4px",
                                      display: "inline-block",
                                      fontWeight: "bold",
                                      fontSize: "0.75rem",
                                      textAlign: "center",
                                    }}
                                  >
                                    {google2faSecret}
                                  </MDTypography>
                                </MDBox>

                                {/* Show Password Input if the Disable Button is Clicked */}
                                {showPasswordInput ? (
                                  <>
                                    <MDTypography variant="body2" color="text" mt={1} mb={2}>
                                      Provide your current password to continue disable MFA.
                                    </MDTypography>
                                    {mfaError && ( // Conditionally render the error message
                                      <MDTypography variant="body2" color="error" mb={2}>
                                        {mfaError}
                                      </MDTypography>
                                    )}
                                    {/* Input for Current Password */}
                                    <MDBox mt={2}>
                                      <MDInput
                                        type="password"
                                        label="Enter Current Password"
                                        variant="outlined"
                                        fullWidth
                                        value={mfaCurrentPassword}
                                        onChange={(e) => setMFACurrentPassword(e.target.value)}
                                      />
                                    </MDBox>

                                    {/* Buttons for Submit and Cancel */}
                                    <MDBox display="flex" justifyContent="flex-end" mt={2} gap={2}>
                                      <MDButton
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleCancelDisableMFA}
                                      >
                                        Cancel
                                      </MDButton>

                                      <MDButton
                                        variant="gradient"
                                        color="dark"
                                        onClick={handleDisableMFA}
                                      >
                                        Save
                                      </MDButton>
                                    </MDBox>
                                  </>
                                ) : (
                                  // Default Disable MFA Button
                                  <MDButton
                                    variant="gradient"
                                    color="error"
                                    onClick={handleShowPasswordInput}
                                  >
                                    Disable MFA
                                  </MDButton>
                                )}
                              </>
                            ) : qrCode ? (
                              <>
                                <MDTypography variant="body2" color="text" mt={1} mb={2}>
                                  Scan this QR Code with Google Authenticator:
                                </MDTypography>
                                <MDBox display="flex" justifyContent="center" width="100%">
                                  <img
                                    src={`data:image/svg+xml;base64,${qrCode}`}
                                    alt="MFA QR Code"
                                    style={{ maxWidth: "200px", height: "auto" }}
                                  />
                                </MDBox>

                                <MDBox mt={2} display="flex" alignItems="center" gap={2}>
                                  <MDTypography variant="body2" color="text">
                                    Secret Key:
                                  </MDTypography>
                                  <MDTypography
                                    variant="body2"
                                    sx={{
                                      backgroundColor: "#f5f5f5",
                                      padding: "8px",
                                      borderRadius: "4px",
                                      display: "inline-block",
                                      fontWeight: "bold",
                                      fontSize: "0.75rem",
                                      textAlign: "center",
                                      width: "auto",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {secret}
                                  </MDTypography>
                                </MDBox>

                                {/* Input for 6-digit Code */}
                                <MDInput
                                  label="Enter 6-digit Code"
                                  variant="outlined"
                                  fullWidth
                                  value={mfaCode}
                                  onChange={(e) => setMfaCode(e.target.value)}
                                  sx={{ mt: 2 }}
                                />

                                {/* Buttons to Verify MFA Code and Cancel */}
                                <MDBox
                                  display="flex"
                                  justifyContent="flex-end"
                                  gap={2}
                                  sx={{ mt: 2 }}
                                >
                                  <MDButton
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => {
                                      setQrCode("");
                                      setSecret("");
                                      setMfaCode("");
                                    }}
                                  >
                                    Cancel
                                  </MDButton>

                                  <MDButton
                                    variant="gradient"
                                    color="success"
                                    onClick={handleVerifyMFA}
                                  >
                                    Enable MFA
                                  </MDButton>
                                </MDBox>
                              </>
                            ) : (
                              <>
                                <MDTypography variant="body2" color="text" mt={1} mb={2}>
                                  By enabling this, you need to provide a Time-Based One-Time
                                  Password (TOTP) in the Google Authenticator app whenever you log
                                  in to your account.
                                </MDTypography>

                                <MDButton variant="gradient" color="dark" onClick={handleEnableMFA}>
                                  Enable MFA
                                </MDButton>
                              </>
                            )}
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                  </Grid>

                  {/* Delete account Section */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <MDBox>
                          <MDTypography variant="h5" fontWeight="medium">
                            Delete Account
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mt={1}>
                            Permanently delete your account.
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            <MDTypography variant="body2" color="text" mt={1} mb={2}>
                              Once your account is deleted, all of its resources and data will be
                              permanently deleted. Before deleting your account, please save any
                              data or information that you wish to retain.
                            </MDTypography>
                            {!isDeleteClicked ? (
                              // Show the Delete Account button

                              <MDButton
                                variant="gradient"
                                color="error"
                                onClick={handleDeleteConfirmation}
                                disabled={loadingDelete}
                              >
                                {loadingDelete ? <CircularProgress size={20} /> : "Delete Account"}
                              </MDButton>
                            ) : (
                              // When the button is clicked, show the confirmation section
                              <>
                                <MDBox mt={2}>
                                  <form onSubmit={handleDeleteAccount}>
                                    {/* Add your input fields here, e.g., password or confirmation input */}

                                    <MDBox mt={3}>
                                      <MDTypography variant="body2" color="error" mb={2}>
                                        Are you sure you want to delete your account? This action
                                        cannot be undone.
                                      </MDTypography>
                                      {deleteError && ( // Conditionally render the error message
                                        <MDTypography variant="body2" color="error" mb={2}>
                                          {deleteError}
                                        </MDTypography>
                                      )}
                                      <MDBox mb={3}>
                                        <MDInput
                                          type="password"
                                          label="Enter Current Password"
                                          name="current_password"
                                          value={deleteCurrentPassword || ""}
                                          onChange={(e) => setDeleteCurrentPassword(e.target.value)} // Update the currentPassword state
                                          fullWidth
                                        />
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="flex-end">
                                        <MDBox display="flex" gap={2}>
                                          <MDButton
                                            variant="outlined"
                                            color="secondary"
                                            onClick={cancelDelete}
                                          >
                                            Cancel
                                          </MDButton>
                                          <MDButton
                                            variant="gradient"
                                            color="error"
                                            type="submit"
                                            disabled={loadingDelete}
                                          >
                                            {loadingDelete ? (
                                              <CircularProgress size={20} />
                                            ) : (
                                              "Yes, Delete Account"
                                            )}
                                          </MDButton>
                                        </MDBox>
                                      </MDBox>
                                    </MDBox>
                                  </form>
                                </MDBox>
                              </>
                            )}
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      {/* Snackbar Component */}
      <MDSnackbar
        color={snackbarType}
        icon={snackbarType === "success" ? "check_circle" : "error"}
        title={snackbarType === "success" ? "Success" : "Error"}
        content={snackbarMessage}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        closeColor="white"
        bgWhite
      />
    </DashboardLayout>
  );
}

ProfileForm.propTypes = {
  onSave: PropTypes.func,
};

export default ProfileForm;
