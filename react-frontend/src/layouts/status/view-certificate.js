import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { format } from "date-fns";

// Blockchain utility function
import { getBlockchain } from "utils/blockchain";
import { getStatusBySerialNumber } from "utils/api";

function VerifyCertificate() {
  const location = useLocation(); // Access the passed state from the navigate function

  // Destructure the passed data from location.state
  const { email, serial_number, created_at, file_hash } = location.state || {};

  // Blockchain state and functions
  const [certificateDetails, setCertificateDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [status, setStatus] = useState("");

  const [transactionReceipt, setTransactionReceipt] = useState({
    transactionHash: "",
    from: "",
    to: "",
    blockNumber: "",
    gasUsed: "",
    status: "",
  });

  // Fetch status details using useEffect
  useEffect(() => {
    const fetchStatusDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token"); // Get token from localStorage (or from context)

        const response = await getStatusBySerialNumber(email, serial_number, created_at, token);
        setStatus(response.data);

        setIsLoading(false);
      } catch (error) {
        setStatus(null);
        setErrorMessage("Error fetching certificate details.");
        setIsLoading(false);
      }
    };

    fetchStatusDetails();
  }, [email, serial_number, created_at]);

  // Fetch certificate data from the blockchain using the serial number
  useEffect(() => {
    if (serial_number) {
      fetchCertificateData(serial_number);
    }
  }, [serial_number]);

  const fetchCertificateData = async (serialNumber) => {
    try {
      setIsLoading(true);
      const { userAccount, contract } = await getBlockchain();

      // Check if fileHash is available in the state
      if (!file_hash) {
        setErrorMessage("File hash is missing.");
        setIsLoading(false);
        return;
      }

      // Call the smart contract's verifyCertificate function with serialNumber and fileHash
      const verifyTx = await contract.methods.verifyCertificate(serialNumber, file_hash).send({
        from: userAccount,
        gas: 3000000, // Set an appropriate gas limit
      });

      // Create a transaction receipt object
      const receipt = {
        transactionHash: verifyTx.transactionHash || "",
        from: verifyTx.from || "",
        to: verifyTx.to || "",
        blockNumber: verifyTx.blockNumber?.toString() || "",
        gasUsed: verifyTx.gasUsed?.toString() || "",
        status: verifyTx.status ? "Success" : "Failed",
      };

      setTransactionReceipt(receipt);

      // If the verification is successful, fetch the certificate details
      const certificate = await contract.methods.getCertificate(serialNumber).call();
      if (certificate) {
        setCertificateDetails({
          serialNumber,
          name: certificate[1] || "",
          cid: certificate[2] || "",
          icNumber: certificate[3] || "",
          studentId: certificate[4] || "",
          courseName: certificate[5] || "",
          issuedDate: certificate[6] || "",
        });
      } else {
        setCertificateDetails(null);
        setErrorMessage("Certificate not found.");
      }

      setIsLoading(false);
      setVerificationAttempted(true);
    } catch (error) {
      setTransactionReceipt(null); // Reset transaction receipt on error
      setCertificateDetails(null);

      // Handle error messages based on the type of failure
      if (error.message.includes("Certificate hash does not match")) {
        setErrorMessage("Certificate hash does not match.");
      } else if (error.message.includes("Certificate not found")) {
        setErrorMessage("Certificate not found.");
      } else if (error?.data?.reason) {
        // If there's a reason in the error data, display it
        setErrorMessage(error.data.reason || "An unexpected error occurred.");
      } else {
        setErrorMessage(
          "Certificate not found or your file has been tampered. If tampered, please provide original file."
        );
      }

      setIsLoading(false);
      setVerificationAttempted(true);
    }
  };

  const formattedIssuedDate = certificateDetails?.issuedDate
    ? format(new Date(certificateDetails.issuedDate), "dd/MM/yyyy, h:mm a")
    : "";

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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="dark">
                  Certificate Details
                </MDTypography>
                <MDTypography variant="body2" color="error">
                  (This is one-time view only)
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {/* Render error message only if there's an error */}
                {verificationAttempted && !certificateDetails && !isLoading && errorMessage && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}

                {/* Only render the form if there's no error message */}
                {!(verificationAttempted && !certificateDetails && !isLoading && errorMessage) && (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <MDBox mt={3}>
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
                      <MDInput
                        label="Student ID"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.studentId || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="IC Number"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.icNumber || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Serial Number"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.serialNumber || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Course Name"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.courseName || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Issued Date"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formattedIssuedDate}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="CID"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={certificateDetails?.cid || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </MDBox>
                  </form>
                )}
              </MDBox>
            </Card>
            <Card sx={{ marginTop: 5 }}>
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
                  Requester Details
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <MDBox mt={3}>
                    <MDInput
                      label="Name"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={status?.name || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <MDInput
                      label="Ic Number"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={status?.ic_number || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <MDInput
                      label="Email"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={status?.email || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <MDInput
                      label="Status"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={status?.status || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>

          {/* Certificate PDF Preview Card */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
            <Card>
              <MDBox
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="dark">
                  Certificate PDF Preview
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {certificateDetails && certificateDetails.cid ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "325px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {/* Use an iframe to display the PDF from IPFS */}
                    <iframe
                      src={`http://127.0.0.1:8080/ipfs/${certificateDetails.cid}`}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="Certificate PDF"
                    />
                  </div>
                ) : (
                  <MDTypography variant="body2" color="textSecondary">
                    No certificate data to display.
                  </MDTypography>
                )}
              </MDBox>
            </Card>
            <Card sx={{ marginTop: 5 }}>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="dark">
                  Blockchain Details
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {/* Display error message if verification attempted, no certificate details, and no loading state */}
                {verificationAttempted && !certificateDetails && !isLoading && errorMessage && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}

                {/* Render the form only if no error message */}
                {!(verificationAttempted && !certificateDetails && !isLoading && errorMessage) && (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <MDBox mt={3}>
                      <MDInput
                        label="Transaction Hash"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={transactionReceipt?.transactionHash || "N/A"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="From"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={transactionReceipt?.from || "N/A"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="To"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={transactionReceipt?.to || "N/A"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Block Number"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={transactionReceipt?.blockNumber?.toString() || "N/A"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Gas Used"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={transactionReceipt?.gasUsed?.toString() || "N/A"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Status"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={transactionReceipt?.status || "N/A"}
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
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VerifyCertificate;
