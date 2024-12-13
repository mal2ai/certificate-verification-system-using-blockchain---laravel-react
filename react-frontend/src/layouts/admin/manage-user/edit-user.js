import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Utility functions
import { getUserById, updateUser } from "utils/api";

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await getUserById(id, token); // Call the utility function
        const user = response.data; // Assuming API returns user details in `data`

        setName(user.name || "");
        setEmail(user.email || "");
        setRole(user.role || "");
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to fetch user details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserDetails();
    } else {
      console.error("User ID is missing.");
    }
  }, [id]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleRoleChange = (e) => setRole(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const data = { name, email, role };
      await updateUser(id, data, token);

      navigate("/admin/manage-user", {
        state: { successMessage: "User updated successfully!" },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while updating the user. Please try again.");
    } finally {
      setLoading(false);
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
                  Edit User
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Name"
                      fullWidth
                      value={isLoading ? "Loading..." : name}
                      onChange={handleNameChange}
                      disabled={isLoading}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="email"
                      label="Email"
                      fullWidth
                      value={isLoading ? "Loading..." : email}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <FormControl fullWidth>
                      {/* Add InputLabel for label */}
                      <MDTypography
                        sx={{
                          // Adjust height for the Select box
                          fontSize: "0.9rem", // Optional: Increase font size
                        }}
                        color="dark"
                      >
                        {isLoading ? "Loading..." : "Select Role:"}
                      </MDTypography>
                      <Select
                        value={isLoading ? "Loading..." : role}
                        onChange={handleRoleChange}
                        disabled={isLoading}
                        displayEmpty
                        variant="outlined"
                        sx={{
                          height: 30, // Adjust height for the Select box
                          fontSize: "0.85rem", // Optional: Increase font size
                        }}
                      >
                        <MenuItem value="" disabled>
                          {isLoading ? "Loading..." : "Select Role"}
                        </MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>

                  <MDBox display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="gradient"
                      color="dark"
                      type="submit"
                      disabled={loading || isLoading}
                    >
                      {loading ? "Updating..." : "Update"}
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

export default EditUser;
