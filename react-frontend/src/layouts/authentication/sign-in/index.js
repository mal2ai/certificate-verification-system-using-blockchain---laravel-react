import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Ensure correct import of useNavigate

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Utils
import { login } from "utils/api"; // Assuming 'login' is a function you created to handle authentication

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

const Basic = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  useEffect(() => {
    // Check if the token and role are present in localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If the token exists and role is user, redirect to /status
    if (token && role === "user") {
      navigate("/status");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from submitting normally

    try {
      // Attempt to log in with the provided credentials
      const response = await login({ email, password });
      console.log("Login Response:", response); // Debugging

      if (response.data && response.data.token) {
        const token = response.data.token;
        const role = response.data.role;

        // Store token in localStorage or sessionStorage based on "Remember Me"
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("email", email);
          localStorage.setItem("role", role);
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("role", role);
        }

        // Redirect based on role
        if (role === "user") {
          navigate("/status"); // Redirect to /status if role is user
        } else {
          navigate("/admin/dashboard"); // Redirect to /dashboard if role is admin or other
        }
      } else {
        // If the response doesn't contain a token, handle it as an error
        setError("Invalid login credentials. Please check your email and password.");
      }
    } catch (err) {
      // Catch any errors from the login API request
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="dark"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {error && (
              <MDTypography variant="body2" color="error">
                {error}
              </MDTypography>
            )}
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="dark" fullWidth type="submit">
                Sign in
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDButton
                  component={MuiLink}
                  href="/authentication/sign-up" // Navigate to sign-up page
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                  sx={{ padding: 0 }} // Remove padding to make it look like a link
                >
                  Sign up
                </MDButton>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
};

export default Basic;
