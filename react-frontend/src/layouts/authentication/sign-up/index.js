import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "utils/api"; // Ensure the path is correct

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress"; // Import spinner component

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [accountType, setAccountType] = useState("");
  const [studentId, setStudentId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [error, setError] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error state before validation
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords don't match.");
      return;
    }

    if (!termsChecked) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    if (accountType === "student" && !studentId) {
      setError("Student ID is required for student account type.");
      return;
    }

    if (accountType === "potential_employer" && !companyName) {
      setError("Company name is required for potential employer account type.");
      return;
    }

    if (accountType === "educational_institution" && !institutionName) {
      setError("Institution name is required for educational institution account type.");
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      const response = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        account_type: accountType,
        student_id: studentId,
        company_name: companyName,
        institution_name: institutionName,
      });

      // Store the message in localStorage before navigating
      localStorage.setItem("message", response.data.message);

      // Navigate to the /sign-in page without passing the state
      navigate("/sign-in");
    } catch (err) {
      // Check if the error object has a response with data and a message
      const errorMessage =
        err?.response?.data?.message || "Error registering user. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card sx={{ mb: 4 }}>
        <MDBox
          variant="gradient"
          bgColor="dark"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {error && (
              <MDTypography variant="body2" color="error" mb={2}>
                {error}
              </MDTypography>
            )}

            <MDBox mb={2}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  label="Account Type"
                  required
                  sx={{
                    height: "50px",
                    "& .MuiSelect-select": {
                      padding: "10px 14px",
                    },
                  }}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="potential_employer">Potential Employer</MenuItem>
                  <MenuItem value="educational_institution">Educational Institution</MenuItem>
                </Select>
              </FormControl>
            </MDBox>

            {accountType === "student" && (
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Student ID"
                  variant="standard"
                  fullWidth
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </MDBox>
            )}
            {accountType === "potential_employer" && (
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Company Name"
                  variant="standard"
                  fullWidth
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </MDBox>
            )}
            {accountType === "educational_institution" && (
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Institution Name"
                  variant="standard"
                  fullWidth
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              </MDBox>
            )}
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                variant="standard"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirm Password"
                variant="standard"
                fullWidth
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={1} ml={1}>
              <MDTypography variant="caption" color="text" display="block">
                <ul style={{ margin: 0, paddingLeft: "20px", listStyleType: "disc" }}>
                  <li>Password must be at least 6 characters long</li>
                  <li>Must include at least one special character</li>
                  <li>Must include at least one uppercase letter</li>
                  <li>Must include at least one lowercase letter</li>
                  <li>Must include at least one number</li>
                </ul>
              </MDTypography>
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                onClick={() => setTermsChecked(!termsChecked)}
              >
                &nbsp;&nbsp;I agree to the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="dark"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="dark"
                fullWidth
                type="submit"
                disabled={loading} // Disable button during loading
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign up"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/sign-in"
                  variant="button"
                  color="dark"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
