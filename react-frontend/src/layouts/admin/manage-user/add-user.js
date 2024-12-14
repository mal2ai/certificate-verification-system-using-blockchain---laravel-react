import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "utils/api"; // Import the register function

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

function AddUser() {
  const navigate = useNavigate();
  const [name, setName] = useState(""); // State for name
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [passwordConfirmation, setPasswordConfirmation] = useState(""); // State for confirm password
  const [statusMessage, setStatusMessage] = useState(""); // Success/error status message
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button

  // Handle input change for form fields
  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  // Function to handle user registration
  const handleRegister = async () => {
    setIsLoading(true);
    setStatusMessage("");

    // Check if required fields are empty
    if (!name || !email || !password || !passwordConfirmation) {
      setStatusMessage("Please fill in all required fields.");
      setIsLoading(false);
      return; // Stop the function if required fields are empty
    }

    // Check if passwords match
    if (password !== passwordConfirmation) {
      setStatusMessage("Passwords do not match.");
      setIsLoading(false);
      return; // Stop the function if passwords don't match
    }

    // Prepare data for registration
    const data = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation, // Add password confirmation
    };

    try {
      await register(data); // Call register API function
      setStatusMessage("User registered successfully.");
      navigate("/admin/manage-user", {
        state: { successMessage: "User Registered Successfully!" },
      });
    } catch (error) {
      setStatusMessage("Failed to register user. Please try again.");
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
                  Register User
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
                      label="Enter Name"
                      variant="outlined"
                      fullWidth
                      value={name}
                      onChange={(e) => handleInputChange(e, setName)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Enter Email"
                      variant="outlined"
                      fullWidth
                      value={email}
                      onChange={(e) => handleInputChange(e, setEmail)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Enter Password"
                      variant="outlined"
                      fullWidth
                      type="password"
                      value={password}
                      onChange={(e) => handleInputChange(e, setPassword)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Confirm Password"
                      variant="outlined"
                      fullWidth
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => handleInputChange(e, setPasswordConfirmation)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleRegister}
                      sx={{
                        width: "200px",
                        display: "block",
                        margin: "0 auto",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Register"}
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

export default AddUser;
