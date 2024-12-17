import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

// API function to get user details by ID
import { getUserById } from "utils/api";

function ViewUser() {
  const navigate = useNavigate();
  const { serialNumber, id } = useParams();

  const [userDetails, setUserDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to format the created_at date to dd/mm/yyyy h:m am/pm in Malaysia timezone
  const formatDateToMalaysiaTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-MY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kuala_Lumpur",
    }).format(date);
  };

  // Fetch user details by ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("token"); // Get token from localStorage
        const response = await getUserById(id, token); // Fetch user details by ID
        setUserDetails(response.data); // Set user details in the state

        setIsLoading(false);
      } catch (error) {
        setUserDetails(null);
        setErrorMessage("Error fetching user details.");
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

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
                  User Details
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {isLoading && (
                  <MDTypography variant="body2" color="dark">
                    Loading details...
                  </MDTypography>
                )}
                {!isLoading && errorMessage && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}
                {!isLoading && userDetails && (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <MDBox mt={3}>
                      {/* Display Account Type */}
                      <MDInput
                        label="Account Type"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails.account_type || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      {userDetails.account_type === "potential_employer" && (
                        <MDInput
                          label="Company Name"
                          variant="outlined"
                          fullWidth
                          sx={{ mb: 2 }}
                          value={userDetails.company_name || ""}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      {userDetails.account_type === "educational_institution" && (
                        <MDInput
                          label="Institution Name"
                          variant="outlined"
                          fullWidth
                          sx={{ mb: 2 }}
                          value={userDetails.institution_name || ""}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      <MDInput
                        label="Name"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails.name || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      {/* Conditional Inputs Based on Account Type */}
                      {userDetails.account_type === "student" && (
                        <MDInput
                          label="Student ID"
                          variant="outlined"
                          fullWidth
                          sx={{ mb: 2 }}
                          value={userDetails.student_id || ""}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      <MDInput
                        label="Email"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails.email || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Role"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails.role || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Created at"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formatDateToMalaysiaTime(userDetails.created_at) || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      {/* Display Status */}
                      <MDInput
                        label="Status"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails.status || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </MDBox>
                  </form>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default ViewUser;
