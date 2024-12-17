import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeStatus, getProfileDetails } from "utils/api"; // Import the API functions

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

function VerifyCertificate() {
  const navigate = useNavigate();
  const [serialNumber, setSerialNumber] = useState(""); // State for serial number
  const [name, setName] = useState(""); // State for name
  const [email, setEmail] = useState(""); // State for email
  const [icNumber, setIcNumber] = useState(""); // State for IC number
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button
  const [statusMessage, setStatusMessage] = useState(""); // Success/error status message

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const token = localStorage.getItem("token"); // Get the token from localStorage

      if (!token) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/sign-in"); // Redirect to login if token is not available
        return;
      }

      try {
        const response = await getProfileDetails(token);
        setName(response.data.data.name);
        setEmail(response.data.data.email);
      } catch (error) {
        console.error("Failed to fetch profile details:", error);
        setStatusMessage("Unable to retrieve user details. Please try again later.");
      }
    };

    fetchProfileDetails();
  }, [navigate]);

  // Handle input change for any field
  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  // Function to handle the verify button click and store status
  const handleVerify = async () => {
    setIsLoading(true);
    setErrorMessage("");

    // Check if required fields are empty
    if (!name || !serialNumber || !icNumber) {
      setStatusMessage("Please fill in all required fields.");
      setIsLoading(false);
      return; // Stop the function if required fields are empty
    }

    const token = localStorage.getItem("token"); // Get token from localStorage

    // Prepare data to send in the API request
    const data = {
      name,
      email,
      serial_number: serialNumber,
      ic_number: icNumber,
      status: "pending", // Default status as pending
    };

    try {
      await storeStatus(data, token); // Call storeStatus API function
      setStatusMessage("Status stored successfully.");

      // Check the role from localStorage
      const role = localStorage.getItem("role"); // Get the role from localStorage

      // Conditionally navigate based on the role
      if (role === "admin") {
        navigate("/admin/request", { state: { successMessage: "Request Sent Successfully!" } });
      } else if (role === "user") {
        navigate("/status", { state: { successMessage: "Request Sent Successfully!" } });
      } else {
        // Optional: handle if role is not found (e.g., redirect to login)
        navigate("/login");
      }
    } catch (error) {
      setStatusMessage("Failed to store status.");
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
                  Verify Certificate
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
                      label="Your Name"
                      variant="outlined"
                      fullWidth
                      value={name}
                      disabled // Make this field non-editable
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Your Email"
                      variant="outlined"
                      fullWidth
                      value={email}
                      disabled // Make this field non-editable
                      sx={{ mb: 2 }}
                    />
                    <MDInput
                      label="Enter IC Number"
                      variant="outlined"
                      fullWidth
                      value={icNumber}
                      onChange={(e) => handleInputChange(e, setIcNumber)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Enter Certificate Serial Number"
                      variant="outlined"
                      fullWidth
                      value={serialNumber}
                      onChange={(e) => handleInputChange(e, setSerialNumber)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDButton
                      variant="gradient"
                      color="dark"
                      onClick={handleVerify}
                      sx={{
                        width: "200px",
                        display: "block",
                        margin: "0 auto",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Send Request"}
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

export default VerifyCertificate;
