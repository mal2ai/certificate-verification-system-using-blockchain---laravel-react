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
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Utility functions
import { getUserById, updateUser, createLog } from "utils/api";

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [accountType, setAccountType] = useState(""); // New state for Account Type
  const [status, setStatus] = useState(""); // New state for Status
  const [studentId, setStudentId] = useState(""); // State for student ID
  const [companyName, setCompanyName] = useState(""); // State for company name
  const [institutionName, setInstitutionName] = useState(""); // State for institution name
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
        setAccountType(user.account_type || ""); // Set Account Type
        setStatus(user.status || ""); // Set Status
        setStudentId(user.student_id || ""); // Set Student ID
        setCompanyName(user.company_name || ""); // Set Company Name
        setInstitutionName(user.institution_name || ""); // Set Institution Name
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
  const handleAccountTypeChange = (e) => setAccountType(e.target.value); // Handle Account Type
  const handleStatusChange = (e) => setStatus(e.target.value); // Handle Status
  const handleStudentIdChange = (e) => setStudentId(e.target.value); // Handle Student ID
  const handleCompanyNameChange = (e) => setCompanyName(e.target.value); // Handle Company Name
  const handleInstitutionNameChange = (e) => setInstitutionName(e.target.value); // Handle Institution Name

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (accountType === "potential_employer" && !companyName.trim()) {
        alert("Company Name is required for Potential Employer accounts.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const data = {
        name,
        email,
        role,
        account_type: accountType,
        status,
        student_id: studentId,
        company_name: accountType === "potential_employer" ? companyName : "",
        institution_name: accountType === "educational_institution" ? institutionName : "",
      };

      await updateUser(id, data, token);

      // Create a log after successful registration
      const adminEmail = localStorage.getItem("email");
      const logData = {
        user_email: email,
        admin_email: adminEmail,
        action: "Update",
        module: "Manage User",
        status: "Success",
      };
      await createLog(logData, token);

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
                position="relative"
              >
                <MDTypography variant="h6" color="dark">
                  Edit User
                </MDTypography>
              </MDBox>

              <MDBox p={3} position="relative">
                {/* Show spinner when loading */}
                {isLoading && (
                  <MDBox
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    zIndex="10" // Makes sure the spinner is on top of other elements
                    bgcolor="rgba(255, 255, 255, 0.8)" // Slightly transparent background
                  >
                    <CircularProgress />
                  </MDBox>
                )}

                {/* Main form content */}
                {!isLoading && (
                  <form onSubmit={handleSubmit}>
                    {/* Account Type Dropdown */}
                    <MDBox mb={2}>
                      <FormControl fullWidth>
                        <InputLabel>Account Type</InputLabel>
                        <Select
                          value={accountType}
                          onChange={handleAccountTypeChange}
                          label="Account Type"
                          required
                          sx={{
                            height: "40px",
                            "& .MuiSelect-select": {
                              padding: "10px 14px",
                            },
                          }}
                        >
                          <MenuItem value="student">Student</MenuItem>
                          <MenuItem value="potential_employer">Potential Employer</MenuItem>
                          <MenuItem value="educational_institution">
                            Educational Institution
                          </MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </MDBox>

                    {/* Conditionally Render Fields Based on Account Type */}
                    {accountType === "student" && (
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          label="Student ID"
                          fullWidth
                          value={studentId}
                          onChange={handleStudentIdChange}
                          disabled={isLoading}
                        />
                      </MDBox>
                    )}

                    {accountType === "potential_employer" && (
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          label="Company Name"
                          fullWidth
                          value={companyName}
                          onChange={handleCompanyNameChange}
                          disabled={isLoading}
                          required
                        />
                      </MDBox>
                    )}

                    {accountType === "educational_institution" && (
                      <MDBox mb={2}>
                        <MDInput
                          type="text"
                          label="Institution Name"
                          fullWidth
                          value={institutionName}
                          onChange={handleInstitutionNameChange}
                          disabled={isLoading}
                        />
                      </MDBox>
                    )}

                    {/* Name Input */}
                    <MDBox mb={2}>
                      <MDInput
                        type="text"
                        label="Name"
                        fullWidth
                        value={name}
                        onChange={handleNameChange}
                        disabled={isLoading}
                      />
                    </MDBox>

                    {/* Email Input */}
                    <MDBox mb={2}>
                      <MDInput
                        type="email"
                        label="Email"
                        fullWidth
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </MDBox>

                    {/* Role Dropdown */}
                    <MDBox mb={2}>
                      <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={role}
                          onChange={handleRoleChange}
                          disabled={isLoading}
                          label="Role"
                          sx={{
                            height: "40px",
                            "& .MuiSelect-select": {
                              padding: "10px 14px",
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select Role
                          </MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="user">User</MenuItem>
                        </Select>
                      </FormControl>
                    </MDBox>

                    {/* Status Dropdown */}
                    <MDBox mb={2}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={status}
                          onChange={handleStatusChange}
                          disabled={isLoading}
                          label="Status"
                          sx={{
                            height: "40px",
                            "& .MuiSelect-select": {
                              padding: "10px 14px",
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select Status
                          </MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="banned">Banned</MenuItem>
                        </Select>
                      </FormControl>
                    </MDBox>

                    {/* Submit Button */}
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

export default EditUser;
