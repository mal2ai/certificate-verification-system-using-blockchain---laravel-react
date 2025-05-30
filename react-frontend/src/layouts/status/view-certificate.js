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
import { getStatusById, storeTransaction, createLog } from "utils/api";

// Material-UI loading spinner
import CircularProgress from "@mui/material/CircularProgress";

function VerifyCertificate() {
  const location = useLocation(); // Access the passed state from the navigate function

  // Destructure the passed data from location.state
  const { id, email, serial_number, created_at, file_hash } = location.state || {};

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

        const response = await getStatusById(id, token); // Call getStatusById with id and token
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
    if (serial_number || file_hash) {
      fetchCertificateData(serial_number, file_hash);
    }
  }, [serial_number, file_hash]);

  const fetchCertificateData = async (serialNumber, file_hash) => {
    console.log("file hash: ", file_hash);
    try {
      setIsLoading(true);
      const { userAccount, contract } = await getBlockchain();
      let verifyTx, certificate;

      if (serialNumber) {
        try {
          // If serial number is available, use verifyCertificate
          verifyTx = await contract.methods.verifyCertificate(serialNumber, file_hash).send({
            from: userAccount,
            gas: 3000000,
          });
          console.log("Method Call: verifyCertificate-serial number");
        } catch (error) {
          setErrorMessage("Certificate not found.");
          setVerificationAttempted(true);
          setIsLoading(false);
          return;
        }
      } else if (file_hash) {
        console.log("Method Call: verifyCertificateByHash");
        try {
          // If serial number is empty but file hash is available, use verifyCertificateByHash
          verifyTx = await contract.methods.verifyCertificateByHash(file_hash).send({
            from: userAccount,
            gas: 3000000,
          });

          // Extract serial number from event logs
          const event = verifyTx.events?.CertificateVerified;
          serialNumber = event?.returnValues?.[0]; // Extract serial number from event logs

          if (!serialNumber) {
            throw new Error("Certificate not found.");
          }
        } catch (error) {
          setErrorMessage("Certificate not found.");
          setVerificationAttempted(true);
          setIsLoading(false);
          return;
        }
      } else {
        setErrorMessage("Both Serial Number and File Hash are missing.");
        setIsLoading(false);
        return;
      }

      // Create a transaction receipt object
      const receipt = {
        transactionHash: verifyTx.transactionHash || "",
        from: verifyTx.from || "",
        to: verifyTx.to || "",
        blockNumber: verifyTx.blockNumber?.toString() || "",
        gasUsed: verifyTx.gasUsed?.toString() || "",
        status: verifyTx.status ? "Success" : "Failed",
        action: "Verify",
      };

      setTransactionReceipt(receipt);

      // Store transaction details in Laravel backend
      if (receipt) {
        const token = localStorage.getItem("token");
        await storeTransaction(receipt, token);
      }

      // Create a log after successful verification
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("email");
      const logData = {
        req_id: id,
        user_email: userEmail,
        action: "Verify",
        module: "User",
        serial_number: serialNumber,
        tx_hash: verifyTx.transactionHash,
        status: "Success",
      };
      await createLog(logData, token);

      // Fetch certificate details after successful verification
      certificate = await contract.methods.getCertificate(serialNumber).call();

      if (certificate) {
        setCertificateDetails({
          serialNumber,
          name: certificate[1] || "",
          cid: certificate[2] || "",
          icNumber: certificate[3] || "",
          studentId: certificate[4] || "",
          courseName: certificate[5] || "",
          issuedDate: certificate[6] || "",
          transCID: certificate[8] || "",
        });
      } else {
        setCertificateDetails(null);
        setErrorMessage("Certificate not found.");
      }

      setIsLoading(false);
      setVerificationAttempted(true);
    } catch (error) {
      setTransactionReceipt(null);
      setCertificateDetails(null);

      // Handle error messages
      if (error.message.includes("Certificate hash does not match")) {
        setErrorMessage("Certificate hash does not match.");
      } else if (error.message.includes("Certificate not found")) {
        setErrorMessage("Certificate not found.");
      } else if (error?.data?.reason) {
        setErrorMessage(
          error.data.reason ||
            "Certificate not found or your file has been tampered. If tampered, please provide the original file."
        );
      } else {
        setErrorMessage(
          "Certificate not found or your file has been tampered. If tampered, please provide the original file."
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
                {/* Show loading indicator while fetching */}
                {isLoading ? (
                  <MDBox
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%", // Ensures the spinner is vertically centered within the parent
                      width: "100%", // Ensures the spinner takes full width of the parent
                    }}
                  >
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <>
                    {verificationAttempted && !certificateDetails && !isLoading && errorMessage && (
                      <MDTypography variant="body2" color="error">
                        {errorMessage}
                      </MDTypography>
                    )}

                    {!(
                      verificationAttempted &&
                      !certificateDetails &&
                      !isLoading &&
                      errorMessage
                    ) && (
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
                            value={certificateDetails?.issuedDate || ""}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                          <MDInput
                            label="CertCID"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={certificateDetails?.cid || ""}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                          <MDInput
                            label="TransCID"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={certificateDetails?.transCID || ""}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </MDBox>
                      </form>
                    )}
                  </>
                )}
              </MDBox>
            </Card>

            {/* Requester Details Card */}
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
                {/* Show loading indicator while fetching */}
                {isLoading ? (
                  <MDBox
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%", // Ensures the spinner is vertically centered within the parent
                      width: "100%", // Ensures the spinner takes full width of the parent
                    }}
                  >
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <>
                    {status ? (
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
                            label="Email"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={status?.email || ""}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                          {status?.ic_number?.trim() && (
                            <MDInput
                              label="IC Number"
                              variant="outlined"
                              fullWidth
                              sx={{ mb: 2 }}
                              value={status.ic_number}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          )}

                          {(certificateDetails?.serialNumber?.trim() || serial_number) && (
                            <MDInput
                              label="Serial Number"
                              variant="outlined"
                              fullWidth
                              sx={{ mb: 2 }}
                              value={certificateDetails?.serialNumber || serial_number}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          )}

                          {file_hash?.trim() && (
                            <MDInput
                              label="File Hash"
                              variant="outlined"
                              fullWidth
                              sx={{ mb: 2 }}
                              value={file_hash}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          )}
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
                    ) : (
                      errorMessage && (
                        <MDTypography variant="body2" color="error">
                          {errorMessage}
                        </MDTypography>
                      )
                    )}
                  </>
                )}
              </MDBox>
            </Card>

            {/* Blockchain Details Card */}
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
                {/* Show error message if verification attempted, no certificate details, and no loading state */}
                {verificationAttempted && !certificateDetails && !isLoading && errorMessage && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}

                {/* Render loading spinner if data is being fetched */}
                {isLoading ? (
                  <MDBox
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%", // Ensures the spinner is vertically centered within the parent
                      width: "100%", // Ensures the spinner takes full width of the parent
                    }}
                  >
                    <CircularProgress />
                  </MDBox>
                ) : (
                  // Only render the form if no error message and data is not loading
                  !(verificationAttempted && !certificateDetails && !isLoading && errorMessage) && (
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
                  )
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Right side panel */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
            {/* Certificate PDF Preview Card */}
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
                {/* Show loading spinner if the certificate details are loading */}
                {isLoading ? (
                  <MDBox
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <CircularProgress />
                  </MDBox>
                ) : certificateDetails && certificateDetails.cid ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "450px",
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

            {/* Transcript PDF Preview Card */}
            <Card sx={{ marginTop: 5 }}>
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
                  Transcript PDF Preview
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {/* Show loading spinner if the certificate details are loading */}
                {isLoading ? (
                  <MDBox
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <CircularProgress />
                  </MDBox>
                ) : certificateDetails && certificateDetails.transCID ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "450px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {/* Use an iframe to display the PDF from IPFS */}
                    <iframe
                      src={`http://127.0.0.1:8080/ipfs/${certificateDetails.transCID}`}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="Transcript PDF"
                    />
                  </div>
                ) : (
                  <MDTypography variant="body2" color="textSecondary">
                    No transcript data to display.
                  </MDTypography>
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
