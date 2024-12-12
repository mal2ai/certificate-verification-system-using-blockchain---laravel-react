import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeStatus } from "utils/api"; // Import the storeStatus function

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
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button
  const [statusMessage, setStatusMessage] = useState(""); // Success/error status message

  // Handle input change for name, email, and serial number
  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  // Function to handle the verify button click and store status
  const handleVerify = async () => {
    setIsLoading(true);
    setErrorMessage("");

    // Check if required fields are empty
    if (!name || !serialNumber) {
      setStatusMessage("Please fill in all required fields.");
      setIsLoading(false);
      return; // Stop the function if required fields are empty
    }

    const token = localStorage.getItem("token"); // Get token from localStorage
    const email = localStorage.getItem("email");

    // Prepare data to send in the API request
    const data = {
      name,
      email: email,
      serial_number: serialNumber,
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
                      label="Enter Your Name"
                      variant="outlined"
                      fullWidth
                      value={name}
                      onChange={(e) => handleInputChange(e, setName)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Enter Your Email"
                      variant="outlined"
                      fullWidth
                      value={localStorage.getItem("email") || ""} // Get email from localStorage
                      disabled // Disable the field so it's not editable
                      sx={{ mb: 2 }}
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
                      color="info"
                      onClick={handleVerify}
                      sx={{
                        width: "200px",
                        display: "block",
                        margin: "0 auto",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Sent Request"}
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
