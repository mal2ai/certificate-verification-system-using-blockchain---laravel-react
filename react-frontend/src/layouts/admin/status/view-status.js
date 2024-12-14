import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar"; // Importing MDSnackbar

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API function to get user details by email, delete status, and send OTP
import { getUserDetailsByEmail, deleteStatus, sendOTP } from "utils/api";

function VerifyCertificate() {
  const navigate = useNavigate();
  const { serialNumber } = useParams();
  const location = useLocation(); // Accessing location state

  const [certificateDetails, setCertificateDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // State for storing user details
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state
  const [snackbarType, setSnackbarType] = useState("success"); // Snackbar type (success or error)
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar visibility

  // Destructure the passed data from location.state
  const { name, email, serial_number, status } = location.state || {};

  // Fetch user details by email
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("token"); // Get token from localStorage (or from context)

        const response = await getUserDetailsByEmail(email, token); // Fetch user details by email
        setUserDetails(response.data); // Set user details in the state

        setIsLoading(false);
        setVerificationAttempted(true);
      } catch (error) {
        setUserDetails(null);
        setErrorMessage("Error fetching user details.");
        setIsLoading(false);
        setVerificationAttempted(true);
      }
    };

    fetchUserDetails();
  }, [email]); // Adding email as dependency to re-fetch if email changes

  // Handle the View Certificate button click
  const handleViewCertificate = () => {
    navigate(`/admin/view-certificate/${serial_number}`);
  };

  // Handle Delete Certificate button click
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token"); // Get token from localStorage
      await deleteStatus(serial_number, token); // Call delete function
      setIsLoading(false);

      // Navigate back with a success message
      setSnackbarMessage(`Request ${serial_number} Deleted Successfully!`);
      setSnackbarType("success");
      setOpenSnackbar(true);

      navigate("/admin/request", {
        state: { successMessage: `Request ${serial_number} Deleted Successfully!` },
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Error deleting request");
      setSnackbarMessage(error.message || "Error deleting request");
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };

  // Handle Resend OTP button click
  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token"); // Get token from localStorage
      await sendOTP(email, token); // Call sendOTP function
      setIsLoading(false);

      setSnackbarMessage("OTP sent successfully.");
      setSnackbarType("success");
      setOpenSnackbar(true);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Error sending OTP");
      setSnackbarMessage(error.message || "Error sending OTP");
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };

  // Show success message if available in the location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarType("success");
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Certificate Details Card */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="dark">
                  Request Details
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {verificationAttempted && !certificateDetails && !isLoading && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}
                <form onSubmit={(e) => e.preventDefault()}>
                  <MDBox mt={3}>
                    <MDInput
                      label="Name"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={name || certificateDetails?.name || ""}
                      disabled
                    />
                    <MDInput
                      label="Serial Number"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={serial_number || serialNumber || ""}
                      disabled
                    />
                    {/* Additional Fields */}
                    <MDInput
                      label="Email"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={email || userDetails?.email || ""}
                      disabled
                    />
                    <MDInput
                      label="Status"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={status || userDetails?.status || ""}
                      disabled
                    />
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>

          {/* Account Info Card */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="dark">
                  Account Details
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {verificationAttempted && !userDetails && !isLoading && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}
                <form onSubmit={(e) => e.preventDefault()}>
                  <MDBox mt={3}>
                    <MDInput
                      label="ID"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={userDetails?.id || ""}
                      disabled
                    />
                    <MDInput
                      label="Name"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={userDetails?.name || ""}
                      disabled
                    />
                    <MDInput
                      label="Email"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={userDetails?.email || ""}
                      disabled
                    />
                    <MDInput
                      label="Role"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={userDetails?.role || ""}
                      disabled
                    />
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* View Certificate, Delete, and Resend OTP Buttons */}
        <MDBox mt={3} display="flex" justifyContent="center" gap={2}>
          <MDButton
            variant="gradient"
            color="error"
            sx={{ maxWidth: 200 }} // Adjust the maxWidth for a smaller button
            onClick={handleDelete}
          >
            Delete Request
          </MDButton>
          <MDButton
            variant="contained"
            color="warning"
            sx={{ maxWidth: 200 }} // Adjust the maxWidth for a smaller button
            onClick={handleResendOTP}
            disabled={status === "rejected" || status === "pending"} // Disable button if status is 'rejected' or 'pending'
          >
            Resend OTP
          </MDButton>
          <MDButton
            variant="contained"
            color="info"
            sx={{ maxWidth: 200 }} // Adjust the maxWidth for a smaller button
            onClick={handleViewCertificate}
          >
            View Certificate
          </MDButton>
        </MDBox>
      </MDBox>

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

      <Footer />
    </DashboardLayout>
  );
}

export default VerifyCertificate;
