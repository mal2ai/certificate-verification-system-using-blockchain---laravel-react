import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Material UI Table components
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

// Utility to interact with API
import { deleteUser, getUserById } from "utils/api";

function DeleteUser() {
  const { id } = useParams(); // Assume userId is passed as a URL parameter
  const navigate = useNavigate();

  // States to hold user data and loading state
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data using the userId
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
        const response = await getUserById(id, token); // Use the getUserById function
        const userData = response.data;

        if (userData) {
          setUserDetails(userData);
        }

        setIsLoading(false);
      } catch (error) {
        alert("Error fetching user details.");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  // Handle user deletion
  const handleDelete = async () => {
    const token = localStorage.getItem("token"); // Get token from localStorage

    try {
      // Call the deleteUser function to delete the user
      await deleteUser(id, token);

      console.log(`User with ID ${id} deleted`);

      // After successful deletion, navigate to the users page and pass the success message
      navigate("/admin/manage-user", {
        state: { successMessage: `User ${id} Deleted Successfully!` },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  // Render the user details based on account type
  const renderAccountDetails = () => {
    if (!userDetails) return null;

    const { accountType, status, studentId, companyName, institutionName } = userDetails;

    return (
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Account Type</strong>
              </TableCell>
              <TableCell>{userDetails.account_type || "N/A"}</TableCell>
            </TableRow>
            {userDetails.account_type === "educational_institution" && (
              <TableRow>
                <TableCell>
                  <strong>Institution Name</strong>
                </TableCell>
                <TableCell>{userDetails.institution_name || "N/A"}</TableCell>
              </TableRow>
            )}
            {userDetails.account_type === "potential_employer" && (
              <TableRow>
                <TableCell>
                  <strong>Company Name</strong>
                </TableCell>
                <TableCell>{userDetails.company_name || "N/A"}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>{userDetails.name}</TableCell>
            </TableRow>
            {/* Conditionally render the relevant input field based on account type */}
            {userDetails.account_type === "student" && (
              <TableRow>
                <TableCell>
                  <strong>Student ID</strong>
                </TableCell>
                <TableCell>{userDetails.student_id || "N/A"}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>{userDetails.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>{status || "N/A"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="dark">
                  Are you sure you want to delete this user?
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                {isLoading ? (
                  <MDTypography variant="h6" align="center">
                    Loading user details...
                  </MDTypography>
                ) : (
                  renderAccountDetails()
                )}
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                pt={4}
                pb={4}
                px={3}
              >
                <MDBox display="flex" justifyContent="space-between" width="100%" sx={{ mb: 2 }}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => navigate("/admin/manage-user")}
                    sx={{ width: "48%", marginRight: "4%" }}
                  >
                    Cancel
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="error"
                    onClick={handleDelete}
                    sx={{ width: "48%" }}
                  >
                    Yes, Delete
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default DeleteUser;
