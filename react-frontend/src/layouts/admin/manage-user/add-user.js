import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, createLog } from "utils/api";

// UI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function AddUser() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState("Please choose"); // Default status
  const [accountType, setAccountType] = useState("Please choose"); // Default account type
  const [studentId, setStudentId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // For password visibility toggle
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false); // For password confirmation visibility toggle

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
      return;
    }

    // Check if passwords match
    if (password !== passwordConfirmation) {
      setStatusMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Prepare data for registration
    const data = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      account_type: accountType,
      student_id: accountType === "student" ? studentId : null,
      company_name: accountType === "potential_employer" ? companyName : null,
      institution_name: accountType === "educational_institution" ? institutionName : null,
    };

    try {
      await register(data);
      // setStatusMessage("User registered successfully.");

      // Create a log after successful registration
      const token = localStorage.getItem("token");
      const adminEmail = localStorage.getItem("email");
      const logData = {
        user_email: email,
        admin_email: adminEmail,
        action: "Register",
        module: "Manage User",
        status: "Success",
      };
      await createLog(logData, token);

      navigate("/admin/manage-user", {
        state: { successMessage: "User Registered Successfully!" },
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to register user. Please try again.";
      setStatusMessage(errorMessage);
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
                  Register User
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {statusMessage && (
                  <MDBox mt={2}>
                    <MDTypography variant="body2" sx={{ color: "red" }}>
                      {statusMessage}
                    </MDTypography>
                  </MDBox>
                )}
                <form onSubmit={(e) => e.preventDefault()}>
                  <MDBox mt={3}>
                    {/* Account Type Dropdown */}
                    <FormControl fullWidth>
                      <InputLabel>Account Type</InputLabel>
                      <Select
                        value={accountType}
                        required
                        label="Account Type"
                        onChange={(e) => handleInputChange(e, setAccountType)}
                        sx={{
                          height: "40px", // Adjust the height to your preference
                          "& .MuiSelect-select": {
                            padding: "10px 14px", // Add padding for inner spacing
                          },
                        }}
                      >
                        <MenuItem value="Please choose" disabled>
                          Please choose
                        </MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="potential_employer">Potential Employer</MenuItem>
                        <MenuItem value="educational_institution">Educational Institution</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Conditional Inputs */}
                    {accountType === "student" && (
                      <MDBox mt={3}>
                        <MDInput
                          label="Enter Student ID"
                          variant="outlined"
                          fullWidth
                          value={studentId}
                          onChange={(e) => handleInputChange(e, setStudentId)}
                          required
                        />
                      </MDBox>
                    )}
                    {accountType === "potential_employer" && (
                      <MDBox mt={3}>
                        <MDInput
                          label="Enter Company Name"
                          variant="outlined"
                          fullWidth
                          value={companyName}
                          onChange={(e) => handleInputChange(e, setCompanyName)}
                          required
                        />
                      </MDBox>
                    )}
                    {accountType === "educational_institution" && (
                      <MDBox mt={3}>
                        <MDInput
                          label="Enter Institution Name"
                          variant="outlined"
                          fullWidth
                          value={institutionName}
                          onChange={(e) => handleInputChange(e, setInstitutionName)}
                          required
                        />
                      </MDBox>
                    )}

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
                    </MDBox>
                    <MDInput
                      label="Enter Email"
                      variant="outlined"
                      fullWidth
                      value={email}
                      onChange={(e) => handleInputChange(e, setEmail)}
                      sx={{ mb: 2 }}
                      required
                    />

                    {/* Password Input with Toggle Visibility */}
                    <MDInput
                      label="Enter Password"
                      variant="outlined"
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handleInputChange(e, setPassword)}
                      sx={{ mb: 2 }}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Confirm Password Input with Toggle Visibility */}
                    <MDInput
                      label="Confirm Password"
                      variant="outlined"
                      fullWidth
                      type={showPasswordConfirmation ? "text" : "password"}
                      value={passwordConfirmation}
                      onChange={(e) => handleInputChange(e, setPasswordConfirmation)}
                      sx={{ mb: 2 }}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                              edge="end"
                            >
                              {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Status Dropdown */}
                    {/* <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        fullWidth
                        value={status}
                        label="Status"
                        onChange={(e) => handleInputChange(e, setStatus)}
                        sx={{
                          height: "40px", // Adjust the height to your preference
                          "& .MuiSelect-select": {
                            padding: "10px 14px", // Add padding for inner spacing
                          },
                        }}
                      >
                        <MenuItem value="Please choose" disabled>
                          Please choose
                        </MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="banned">Banned</MenuItem>
                      </Select>
                    </FormControl> */}

                    <MDBox mt={3}>
                      <MDButton
                        variant="gradient"
                        color="dark"
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
