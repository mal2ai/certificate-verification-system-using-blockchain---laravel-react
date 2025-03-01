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
} from "@mui/material";

const VerifyMFA = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    localStorage.removeItem("temp_token");
    localStorage.removeItem("email");
    navigate("/");
  };

  const handleVerifyMFA = async () => {
    setError("");
    setLoading(true);

    const tempToken = localStorage.getItem("temp_token"); // Retrieve temporary token

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      const response = await verify2FA(otp, tempToken); // Call the API function

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", response.data.email);
        localStorage.removeItem("temp_token"); // Remove temp token

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
      <Card sx={{ width: 400, p: 3, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Enter MFA Code
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
            Check your authenticator app and enter the 6-digit code.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            type="text"
            label="6-digit Code"
            variant="outlined"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6 }}
            sx={{ mb: 2 }}
          />

          {/* Buttons: Cancel & Verify */}
          <Box display="flex" justifyContent="space-between" gap={2} mt={2}>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleCancel}
              sx={{
                borderColor: "secondary.main", // Ensures visible border
                color: "secondary.main", // Ensures visible text
                "&:hover": {
                  bgcolor: "secondary.light", // Light background on hover
                  borderColor: "secondary.dark", // Darker border on hover
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
                color: "#ffffff !important",
                "&:hover": { bgcolor: "primary.dark" },
                "&.Mui-disabled": { bgcolor: "primary.light", opacity: 0.7 },
              }}
              onClick={handleVerifyMFA}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Verify"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyMFA;
