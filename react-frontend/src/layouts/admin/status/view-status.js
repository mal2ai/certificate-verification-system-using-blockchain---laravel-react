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
import { getStatusBySerialNumber, deleteStatus, sendOTP, getUserDetailsByEmail } from "utils/api";
import { getBlockchain } from "utils/blockchain";

function VerifyCertificate() {
  const navigate = useNavigate();
  const { serialNumber } = useParams();
  const location = useLocation(); // Accessing location state

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
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!email) {
        throw new Error("Email is required for deletion");
      }

      await deleteStatus(
        certificateDetails?.serial_number || serialNumber,
        certificateDetails?.email,
        token
      ); // Pass both serial_number and email to the delete function
      setIsLoading(false);

      // Navigate back with a success message
      setSnackbarMessage(
        `Request ${
          certificateDetails?.serial_number || serialNumber
        } for ${email} Deleted Successfully!`
      );
      setSnackbarType("success");
      setOpenSnackbar(true);

      navigate("/admin/request", {
        state: { successMessage: `Request ${serialNumber} for ${email} Deleted Successfully!` },
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Error deleting request");
      setSnackbarMessage(error.message || "Error deleting request");
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };

  // Handle Resend OTP button click
  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token"); // Get token from localStorage
      await sendOTP(email, certificateDetails?.id, token); // Call sendOTP function
      setIsLoading(false);

      setSnackbarMessage("OTP sent successfully.");
      setSnackbarType("success");
      setOpenSnackbar(true);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Error sending OTP");
      setSnackbarMessage(error.message || "Error sending OTP");
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setErrorMessage("");

    // Check if the necessary fields are filled
    if (!certificateDetails?.serial_number || !certificateDetails?.file_hash) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarType("error");
      setIsLoading(false);
      setOpenSnackbar(true);
      return;
    }

    try {
      // Retrieve user account and contract from the blockchain
      const { adminAccount, contract } = await getBlockchain();

      // Send transaction to verify the certificate using .send()
      const verifyTx = await contract.methods
        .verifyCertificate(certificateDetails?.serial_number, certificateDetails?.file_hash)
        .send({
          from: adminAccount, // Use the user account
          gas: 3000000, // Set an appropriate gas limit
        });

      // Check if the transaction was successful
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
      setIsLoading(false);
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
          <MDButton
            variant="gradient"
            color="error"
            sx={{ maxWidth: 200 }} // Adjust the maxWidth for a smaller button
            onClick={handleDelete}
          >
            Delete Request
          </MDButton>
          <MDButton
            variant="contained"
            color="warning"
            sx={{ maxWidth: 200 }} // Adjust the maxWidth for a smaller button
            onClick={handleResendOTP}
            disabled={
              certificateDetails?.status === "pending" || certificateDetails?.status === "rejected"
            }
          >
            Resend OTP
          </MDButton>
          <MDButton
            variant="contained"
            color="primary"
            sx={{ maxWidth: 200 }}
            onClick={handleVerify}
          >
            Verify
          </MDButton>
          <MDButton
            variant="contained"
            color="info"
            sx={{ maxWidth: 200 }} // Adjust the maxWidth for a smaller button
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
