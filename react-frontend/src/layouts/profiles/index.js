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

// API functions
import { getProfileDetails, updateProfileDetails, changePassword } from "utils/api";

function ProfileForm({ onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingName, setLoadingName] = useState(false); // Loading state for name input
  const [loadingEmail, setLoadingEmail] = useState(false); // Loading state for email input
  const [loadingPassword, setLoadingPassword] = useState(false); // Loading state for password inputs
  const [token, setToken] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
          const response = await getProfileDetails(token);

          // Check if the response contains the correct data
          if (response && response.data && response.data.data) {
            const profileData = response.data.data; // This contains the actual name and email

            setName(profileData.name || "");
            setEmail(profileData.email || "");
          } else {
            console.error("Profile data is missing:", response);
          }
        } catch (error) {
          console.error("Error fetching profile details:", error);
        } finally {
          setLoadingName(false);
          setLoadingEmail(false);
          setLoading(false);
        }
      };

      fetchProfileDetails();
    }
  }, [token]);

  // Show success message if available in the location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarType("success");
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    if (name === "name") setName(value);
    if (name === "email") setEmail(value);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (token) {
      try {
        setLoadingName(true);
        setLoadingEmail(true);

        // Update profile details
        await updateProfileDetails({ name, email }, token);

        // Fetch updated profile details
        console.log("Request Data: ", { name, email });
        const response = await updateProfileDetails({ name, email }, token);
        console.log("Update Profile Response: ", response);

        if (response && response.data && response.data.data) {
          const updatedProfile = response.data.data;
          setName(updatedProfile.name || "");
          setEmail(updatedProfile.email || "");
        } else {
          console.error("Profile data is missing:", response);
        }

        // Successfully updated
        // onSave({ formType: "profile", name, email });
        setSnackbarMessage("Profile updated successfully!");
        setSnackbarType("success");
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error updating profile details:", error);
        if (error.response) {
          console.error("API Response Error: ", error.response);
          setSnackbarMessage(`Error: ${error.response.data.message || "Unknown error"}`);
        } else {
          setSnackbarMessage("Error updating profile details.");
        }
        setSnackbarType("error");
        setOpenSnackbar(true);
      } finally {
        setLoadingName(false);
        setLoadingEmail(false);
      }
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    if (token) {
      try {
        setLoadingPassword(true);
        // Send request with the correct fields
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
        console.error("Error changing password:", error);
        setSnackbarMessage("Error changing password.");
        setSnackbarType("error");
        setOpenSnackbar(true);
      } finally {
        setLoadingPassword(false);
      }
    }
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
                                  label="Full Name"
                                  name="name"
                                  value={name || ""}
                                  onChange={handleProfileChange}
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
                                  onChange={handleProfileChange}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: loadingEmail ? (
                                      <CircularProgress size={20} />
                                    ) : null,
                                  }}
                                />
                              </MDBox>
                              <MDBox display="flex" justifyContent="flex-end">
                                <MDButton variant="gradient" color="success" type="submit">
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
                          <MDTypography variant="body2" color="text" mt={1}>
                            Ensure your account is using a long, random password to stay secure.
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            <form onSubmit={handlePasswordSubmit}>
                              <MDBox mb={3}>
                                <MDInput
                                  type="password"
                                  label="Current Password"
                                  name="currentPassword"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: loadingPassword ? (
                                      <CircularProgress size={20} />
                                    ) : null,
                                  }}
                                />
                              </MDBox>
                              <MDBox mb={3}>
                                <MDInput
                                  type="password"
                                  label="New Password"
                                  name="newPassword"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: loadingPassword ? (
                                      <CircularProgress size={20} />
                                    ) : null,
                                  }}
                                />
                              </MDBox>
                              <MDBox mb={3}>
                                <MDInput
                                  type="password"
                                  label="Confirm Password"
                                  name="confirmPassword"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: loadingPassword ? (
                                      <CircularProgress size={20} />
                                    ) : null,
                                  }}
                                />
                              </MDBox>
                              <MDBox display="flex" justifyContent="flex-end">
                                <MDButton variant="gradient" color="success" type="submit">
                                  Save
                                </MDButton>
                              </MDBox>
                            </form>
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

      {/* Snackbar */}
      <MDSnackbar
        color={snackbarType}
        icon="check"
        title="Notification"
        content={snackbarMessage}
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        close={false}
        bgWhite
      />
    </DashboardLayout>
  );
}

ProfileForm.propTypes = {
  onSave: PropTypes.func.isRequired,
};

export default ProfileForm;
