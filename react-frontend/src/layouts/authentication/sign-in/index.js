import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress"; // Import CircularProgress

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Import VisibilityIcon
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"; // Import VisibilityOffIcon

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Utils
import { login } from "utils/api";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

const Basic = () => {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();

  useEffect(() => {
    const storedMessage = localStorage.getItem("message");
    if (storedMessage) {
      setMessage(storedMessage);
      localStorage.removeItem("message");
    }

    if (location.state?.message) {
      setMessage(location.state.message);
      localStorage.setItem("message", location.state.message);
    }

    return () => {
      setMessage("");
      localStorage.removeItem("message");
    };
  }, [location.state?.message]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "user") {
      navigate("/status");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading spinner

    try {
      const response = await login({ email, password });

      if (response.data && response.data.token) {
        const { token, role } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);

        navigate(role === "user" ? "/status" : "/admin/dashboard");
      } else if (response.data && response.data.message) {
        setError(response.data.message);
      } else {
        setError("Invalid login credentials. Please check your email and password.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false); // Stop loading spinner
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
            {(error || message) && (
              <MDTypography
                variant="body2"
                color={error ? "error" : "success"}
                sx={{
                  marginBottom: 2,
                  textAlign: "center",
                  display: "block",
                }}
              >
                {error || message}
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
            <MDBox mb={2} sx={{ position: "relative" }}>
              <MDInput
                type={showPassword ? "text" : "password"} // Toggle between text and password
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />
              <div
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </div>
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="dark"
                fullWidth
                type="submit"
                disabled={isLoading} // Disable button during loading
              >
                {isLoading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: "white" }} // Spinner styling
                  />
                ) : (
                  "Sign in"
                )}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDButton
                  component={MuiLink}
                  href="/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                  sx={{ padding: 0 }}
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
