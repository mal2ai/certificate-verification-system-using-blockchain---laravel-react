import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "utils/api"; // Import the verifyOTP function

// UI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation(); // Access passed state from previous page
  const { id, email, serial_number, created_at } = location.state || {}; // Destructure the state

  const [otp, setOtp] = useState(""); // State for OTP
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button
  const [statusMessage, setStatusMessage] = useState(""); // Success/error status message

  // Handle input change for OTP
  const handleInputChange = (event) => {
    setOtp(event.target.value);
  };

  // Function to handle the verify button click and verify OTP
  const handleVerify = async () => {
    setIsLoading(true);
    setErrorMessage("");

    // Check if OTP field is empty
    if (!otp) {
      setStatusMessage("Please enter the OTP.");
      setIsLoading(false);
      return; // Stop the function if OTP is empty
    }

    const token = localStorage.getItem("token"); // Get token from localStorage

    try {
      const response = await verifyOTP(email, otp, id, token); // Call verifyOTP API function
      if (response.status === 200) {
        setStatusMessage("OTP verified successfully.");
        // Navigate to view certificate page with additional data passed via state
        navigate("/view-certificate", {
          state: {
            email,
            serial_number,
            created_at,
          },
        });
      } else {
        setStatusMessage("Failed to verify OTP.");
      }
    } catch (error) {
      setStatusMessage("Failed to verify OTP.");
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
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
                  Verify OTP
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {statusMessage && (
                  <MDBox mt={2}>
                    <MDTypography
                      variant="body2"
                      color={statusMessage.includes("successfully") ? "green" : "red"}
                    >
                      {statusMessage}
                    </MDTypography>
                  </MDBox>
                )}
                <form onSubmit={(e) => e.preventDefault()}>
                  <MDBox mt={3}>
                    <MDInput
                      label="Enter OTP"
                      variant="outlined"
                      fullWidth
                      value={otp}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleVerify}
                      sx={{
                        width: "200px",
                        display: "block",
                        margin: "0 auto",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </MDButton>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default VerifyOTP;
