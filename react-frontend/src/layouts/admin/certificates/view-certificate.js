import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

// Blockchain utility function
import { getBlockchain } from "utils/blockchain";
import { format } from "date-fns";

function VerifyCertificate() {
  const navigate = useNavigate();
  const { serialNumber } = useParams();

  const [certificateDetails, setCertificateDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  // Fetch certificate data based on serial number
  useEffect(() => {
    if (!serialNumber) {
      console.error("Serial Number is missing.");
      return;
    }

    const fetchCertificateData = async () => {
      try {
        setIsLoading(true);
        const { accounts, contract } = await getBlockchain();

        // Fetch certificate details directly without checking approval status
        const certificate = await contract.methods.getCertificate(serialNumber).call();

        if (certificate) {
          const newCertificate = {
            serialNumber,
            name: certificate[1] || "",
            icNumber: certificate[3] || "",
            studentId: certificate[4] || "",
            courseName: certificate[5] || "",
            issuedDate: certificate[6] || "",
            certHash: certificate[7] || "",
            cid: certificate[2] || "", // Assuming `cid` is the IPFS CID
          };
          setCertificateDetails(newCertificate);
        } else {
          setCertificateDetails(null);
          setErrorMessage("Certificate not found.");
        }

        setIsLoading(false);
        setVerificationAttempted(true);
      } catch (error) {
        setCertificateDetails(null);
        setErrorMessage("Certificate not found");
        setIsLoading(false);
        setVerificationAttempted(true);
      }
    };

    fetchCertificateData();
  }, [serialNumber]);

  // Format the issuedDate to 'dd/MM/yyyy, h:mm a'
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
              >
                <MDTypography variant="h6" color="dark">
                  Student Details
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {verificationAttempted && !certificateDetails && !isLoading && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}
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
                      label="Student ID"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={certificateDetails?.studentId || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </MDBox>
                </form>
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
                  Certificate Details
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {verificationAttempted && !certificateDetails && !isLoading && (
                  <MDTypography variant="body2" color="error">
                    {errorMessage}
                  </MDTypography>
                )}
                <form onSubmit={(e) => e.preventDefault()}>
                  <MDBox mt={3}>
                    <MDInput
                      label="Serial Number"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={serialNumber || ""}
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
                    <MDInput
                      label="File Hash"
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={certificateDetails?.certHash || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </MDBox>
                </form>
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
                {certificateDetails && certificateDetails.cid ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "250px", // Reduced height for a smaller preview
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
            <Card sx={{ marginTop: 6 }}>
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
                {/* {certificateDetails ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "250px", // Reduced height for a smaller preview
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <iframe
                      src={`http://127.0.0.1:8080/ipfs/`}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="Certificate PDF"
                    />
                  </div>
                ) : (
                  <MDTypography variant="body2" color="textSecondary">
                    No transcript data to display.
                  </MDTypography>
                )} */}
                <MDTypography
                  variant="body2"
                  color="textSecondary"
                  style={{
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%", // Optional: Full width
                    textAlign: "center", // Center text inside
                  }}
                >
                  Not develop yet.
                </MDTypography>
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
