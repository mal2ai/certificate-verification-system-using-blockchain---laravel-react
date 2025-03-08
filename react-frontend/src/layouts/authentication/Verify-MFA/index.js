import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verify2FA } from "utils/api"; // API function for MFA verification
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

const VerifyMFA = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow only numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only allow one character per input
    setOtp(newOtp);

    // Move focus to the next input field if a number is entered
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Cancel and clear session
  const handleCancel = () => {
    localStorage.removeItem("temp_token");
    localStorage.removeItem("email");
    navigate("/");
  };

  // Handle OTP verification
  const handleVerifyMFA = async () => {
    setError("");
    setLoading(true);

    const tempToken = localStorage.getItem("temp_token");
    const enteredOtp = otp.join(""); // Convert array to string

    if (enteredOtp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      const response = await verify2FA(enteredOtp, tempToken);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", response.data.email);
        localStorage.removeItem("temp_token");

        navigate(response.data.role === "user" ? "/status" : "/admin/dashboard");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Failed to verify MFA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f4f4f4"
    >
      <Card sx={{ width: 400, p: 3, borderRadius: 2, boxShadow: 3, textAlign: "center" }}>
        <CardContent>
          <Box mb={2}>
            <img src="/logo.png" alt="Logo" style={{ height: 60 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Two Step Verification
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter the OTP code from your google authenticator app.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                id={`otp-${index}`}
                type="text"
                variant="outlined"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: "center", fontSize: 20, width: 50, height: 30 },
                }}
              />
            ))}
          </Stack>

          {/* Buttons: Cancel & Verify */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleCancel}
              sx={{
                borderColor: "secondary.main",
                color: "secondary.main",
                "&:hover": {
                  bgcolor: "secondary.light",
                  borderColor: "secondary.dark",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: loading ? "primary.light" : "primary.main",
                color: "#ffffff",
                "&:hover": { bgcolor: "primary.dark" },
              }}
              onClick={handleVerifyMFA}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Verify"}
            </Button>
          </Stack>

          {/* <Typography variant="body2" sx={{ mt: 2 }}>
            Didn&apos;t get the code?{" "}
            <Button variant="text" sx={{ textTransform: "none", fontWeight: "bold" }}>
              Resend
            </Button>
          </Typography> */}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyMFA;
