import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API function to get user details by email, delete status, and send OTP
import {
  getStatusBySerialNumber,
  deleteStatus,
  sendOTP,
  getUserDetailsByEmail,
  createLog,
} from "utils/api";
import { getBlockchain } from "utils/blockchain";

function VerifyCertificate() {
  const navigate = useNavigate();
  const { serialNumber } = useParams();
  const location = useLocation(); // Accessing location state

  const [isDeleting, setIsDeleting] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [certificateDetails, setCertificateDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // State to store user details
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state
  const [snackbarType, setSnackbarType] = useState("success"); // Snackbar type (success or error)
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar visibility

  // Destructure the passed data from location.state
  const { email, serial_number, created_at } = location.state || {}; // Only fetching email, serial_number, and created_at

  // Fetch status details by email, serial_number, and created_at
  useEffect(() => {
    const fetchStatusDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token"); // Get token from localStorage (or from context)

        const response = await getStatusBySerialNumber(email, serial_number, created_at, token);
        setCertificateDetails(response.data); // Set certificate details in the state

        setIsLoading(false);
        setVerificationAttempted(true);
      } catch (error) {
        setCertificateDetails(null);
        setErrorMessage("Error fetching certificate details.");
        setIsLoading(false);
        setVerificationAttempted(true);
      }
    };

    fetchStatusDetails();
  }, [email, serial_number, created_at]);

  // Fetch user account details by email
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token"); // Get token from localStorage

        const response = await getUserDetailsByEmail(email, token);

        setUserDetails(response.data); // Set user details in the state

        setIsLoading(false);
      } catch (error) {
        setErrorMessage("Error fetching user details.");
        setIsLoading(false);
      }
    };

    if (email) {
      fetchUserDetails();
    }
  }, [email]);

  // Handle the View Certificate button click
  const handleViewCertificate = () => {
    navigate(`/admin/view-certificate/${certificateDetails?.serial_number || serialNumber}`);
  };

  // Handle Delete Certificate button click
  const handleDelete = async () => {
    setIsDeleting(true); // Show spinner for delete action
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!email) {
        throw new Error("Email is required for deletion");
      }

      await deleteStatus(
        certificateDetails?.serial_number || serialNumber,
        certificateDetails?.email,
        token
      ); // Pass both serial_number and email to the delete function

      setIsDeleting(false); // Hide spinner after action is done

      // Snackbar and log message
      setSnackbarMessage(
        `Request ${
          certificateDetails?.serial_number || serialNumber
        } for ${email} Deleted Successfully!`
      );
      setSnackbarType("success");
      setOpenSnackbar(true);

      const adminEmail = localStorage.getItem("email");
      const logData = {
        user_email: certificateDetails?.email,
        admin_email: adminEmail,
        action: "Delete",
        module: "Request",
        serial_number: certificateDetails?.serial_number || serialNumber,
        status: "Success",
      };
      await createLog(logData, token);

      navigate("/admin/request", {
        state: {
          successMessage: `Request ${
            certificateDetails?.serial_number || serialNumber
          } for ${email} Deleted Successfully!`,
        },
      });
    } catch (error) {
      setIsDeleting(false); // Hide spinner in case of error
      setErrorMessage(error.message || "Error deleting request");
      setSnackbarMessage(error.message || "Error deleting request");
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };

  // Handle Resend OTP button click
  const handleResendOTP = async () => {
    setIsResendingOTP(true); // Show spinner for resend OTP action
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage
      await sendOTP(email, certificateDetails?.id, token); // Call sendOTP function
      setIsResendingOTP(false); // Hide spinner after action is done

      // Log and Snackbar message
      const adminEmail = localStorage.getItem("email");
      const logData = {
        user_email: certificateDetails?.email,
        admin_email: adminEmail,
        action: "Resend OTP",
        module: "Request",
        serial_number: certificateDetails?.serial_number || serialNumber,
        status: "Success",
      };
      await createLog(logData, token);

      setSnackbarMessage("OTP sent successfully.");
      setSnackbarType("success");
      setOpenSnackbar(true);
    } catch (error) {
      setIsResendingOTP(false); // Hide spinner in case of error
      setErrorMessage(error.message || "Error sending OTP");
      setSnackbarMessage(error.message || "Error sending OTP");
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true); // Show spinner for verify action
    setErrorMessage(""); // Clear previous error messages

    if (!certificateDetails?.serial_number || !certificateDetails?.file_hash) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarType("error");
      setIsVerifying(false); // Hide spinner if validation fails
      setOpenSnackbar(true);
      return;
    }

    try {
      const { adminAccount, contract } = await getBlockchain();

      // Send transaction to verify the certificate using .send()
      const verifyTx = await contract.methods
        .verifyCertificate(certificateDetails?.serial_number, certificateDetails?.file_hash)
        .send({
          from: adminAccount, // Use the user account
          gas: 3000000, // Set an appropriate gas limit
        });

      if (verifyTx.status) {
        setSnackbarMessage("Certificate is valid.");
        setSnackbarType("success");
      } else {
        setSnackbarMessage("Certificate not valid.");
        setSnackbarType("error");
      }
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage("Certificate not valid or file hash has been changed");
      setSnackbarType("error");
      setOpenSnackbar(true);
    } finally {
      setIsVerifying(false); // Hide spinner after transaction completion
    }
  };

  // Show success message if available in the location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarType("success");
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Options for formatting the date and time
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // 12-hour format (AM/PM)
    };

    // Format the date into "dd/mm/yyyy, h:mm AM/PM"
    const formattedDate = date.toLocaleString("en-GB", options);

    return formattedDate;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Certificate Details Card */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
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
                position="relative" // Ensures the spinner is positioned correctly
              >
                <MDTypography variant="h6" color="dark">
                  Request Details
                </MDTypography>
              </MDBox>

              {/* The content container that holds the entire card's content */}
              <MDBox p={3} position="relative">
                {isLoading &&
                  !certificateDetails && ( // Check if the data is loading
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

                {/* Render form only if certificateDetails is available */}
                {!isLoading && certificateDetails && (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <MDBox mt={3}>
                      {/* Display Name */}
                      <MDInput
                        label="Name"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.name || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      {/* Display IC Number */}
                      <MDInput
                        label="IC Number"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.ic_number || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      {/* Display Email */}
                      <MDInput
                        label="Email"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.email || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      {/* Display Serial Number */}
                      <MDInput
                        label="Serial Number"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.serial_number || serialNumber || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      {/* Display Updated At */}
                      <MDInput
                        label="Timestamp"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={
                          certificateDetails?.updated_at
                            ? formatDate(certificateDetails.updated_at)
                            : ""
                        }
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      {/* Display Created At */}
                      <MDInput
                        label="File Hash"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.file_hash}
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
                        value={certificateDetails?.status || ""}
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

          {/* Account Info Card */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
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
                position="relative" // Ensures the spinner is positioned correctly
              >
                <MDTypography variant="h6" color="dark">
                  Account Details
                </MDTypography>
              </MDBox>

              {/* The content container that holds the entire card's content */}
              <MDBox p={3} position="relative">
                {isLoading &&
                  !userDetails && ( // Check if the data is loading
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

                {/* Render form only if userDetails is available */}
                {!isLoading && userDetails && (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <MDBox mt={3}>
                      <MDInput
                        label="Account Type"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails?.account_type || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      {userDetails?.account_type === "potential_employer" && (
                        <MDInput
                          label="Company Name"
                          variant="outlined"
                          fullWidth
                          sx={{ mb: 2 }}
                          value={userDetails?.company_name || ""}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      {userDetails?.account_type === "educational_institution" && (
                        <MDInput
                          label="Institution Name"
                          variant="outlined"
                          fullWidth
                          sx={{ mb: 2 }}
                          value={userDetails?.institution_name || ""}
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
                        value={userDetails?.name || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      {userDetails?.account_type === "student" && (
                        <MDInput
                          label="Student ID"
                          variant="outlined"
                          fullWidth
                          sx={{ mb: 2 }}
                          value={userDetails?.student_id || ""}
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
                        value={userDetails?.email || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Role"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails?.role || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Created at"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails?.created_at ? formatDate(userDetails.created_at) : ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Account Status"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userDetails?.status || ""}
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

        {/* View Certificate, Delete, and Resend OTP Buttons */}
        <MDBox mt={3} display="flex" justifyContent="center" gap={2}>
          {/* Delete Button */}
          <MDButton
            variant="gradient"
            color="error"
            sx={{ maxWidth: 200 }}
            onClick={handleDelete}
            disabled={isDeleting} // Disable button while loading
          >
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Delete Request"}
          </MDButton>

          {/* Resend OTP Button */}
          <MDButton
            variant="contained"
            color="warning"
            sx={{ maxWidth: 200 }}
            onClick={handleResendOTP}
            disabled={
              isResendingOTP ||
              certificateDetails?.status === "pending" ||
              certificateDetails?.status === "rejected"
            }
          >
            {isResendingOTP ? <CircularProgress size={24} color="inherit" /> : "Resend OTP"}
          </MDButton>

          {/* Verify Button */}
          <MDButton
            variant="contained"
            color="primary"
            sx={{ maxWidth: 200 }}
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? <CircularProgress size={24} color="inherit" /> : "Verify"}
          </MDButton>

          {/* View Certificate Button */}
          <MDButton
            variant="contained"
            color="info"
            sx={{ maxWidth: 200 }}
            onClick={handleViewCertificate}
          >
            View Certificate
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Snackbar */}
      <MDSnackbar
        color={snackbarType}
        icon="check"
        title="Notification"
        content={snackbarMessage}
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        close={false}
        bgWhite
      />

      <Footer />
    </DashboardLayout>
  );
}

export default VerifyCertificate;
