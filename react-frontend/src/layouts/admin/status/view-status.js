import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

// API function to get user details by email and delete status
import { getUserDetailsByEmail, deleteStatus } from "utils/api";

function VerifyCertificate() {
  const navigate = useNavigate();
  const { serialNumber } = useParams();
  const location = useLocation(); // Accessing location state

  const [certificateDetails, setCertificateDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // State for storing user details
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

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
      navigate("/admin/request", {
        state: { successMessage: `Request ${serial_number} Deleted Successfully!` },
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Error deleting request");
    }
  };

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
                  Account Info
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

        {/* View Certificate & Delete Buttons */}
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
            color="info"
            sx={{ maxWidth: 200 }} // Adjust the maxWidth for a smaller button
            onClick={handleViewCertificate}
          >
            View Certificate
          </MDButton>
        </MDBox>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VerifyCertificate;
