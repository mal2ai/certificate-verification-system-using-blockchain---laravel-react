import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateDetails } from "utils/api"; // Import the updateDetails function

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
  const location = useLocation();

  const [serialNumber, setSerialNumber] = useState(""); // State for serial number
  const [name, setName] = useState(""); // State for name
  const [email, setEmail] = useState(""); // State for email
  const [icNumber, setIcNumber] = useState(""); // State for IC number
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button
  const [statusMessage, setStatusMessage] = useState(""); // Success/error status message

  // Retrieve passed data from the location state for editing
  useEffect(() => {
    if (location.state) {
      const { name, email, serial_number, ic_number } = location.state.rowData;
      setName(name);
      setEmail(email);
      setSerialNumber(serial_number);
      setIcNumber(ic_number); // Set the IC number if available
    }
  }, [location.state]);

  // Handle input change for name, email, serial number, and IC number
  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  // Function to handle the verify button click and update status details
  const handleVerify = async () => {
    setIsLoading(true);
    setErrorMessage("");

    if (!name || !serialNumber || !icNumber) {
      setStatusMessage("Please fill in all required fields.");
      setIsLoading(false);
      return; // Stop the function if required fields are empty
    }

    const token = localStorage.getItem("token"); // Get token from localStorage
    const email = localStorage.getItem("email"); // Get email from localStorage

    const data = {
      name,
      email, // Use email from localStorage
      serial_number: serialNumber, // New serial number to be updated
      ic_number: icNumber, // New IC number to be updated
      status: "pending", // Default status as pending
    };

    try {
      // Ensure the correct previous serial number is passed in the URL path
      const previousSerialNumber = location.state.rowData.serial_number; // Previous serial number
      await updateDetails(previousSerialNumber, email, data, token); // Pass the previous serial number here
      setStatusMessage("Status updated successfully.");
      navigate("/status", { state: { successMessage: "Update Successfully!" } });
    } catch (error) {
      setStatusMessage("Failed to update status.");
    } finally {
      setIsLoading(false);
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
                  Update Verify Certificate
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
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <MDInput
                      label="Enter Your Email"
                      variant="outlined"
                      fullWidth
                      value={email}
                      InputProps={{
                        readOnly: true,
                      }}
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
                      color="info"
                      onClick={handleVerify}
                      sx={{
                        width: "200px",
                        display: "block",
                        margin: "0 auto",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Update"}
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
