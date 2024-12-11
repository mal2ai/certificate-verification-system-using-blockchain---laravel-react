import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// UI
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

// Utility to interact with the blockchain
import { getBlockchain } from "utils/blockchain";
import DataTable from "examples/Tables/DataTable";

// Import PropTypes
import PropTypes from "prop-types";

function VerifyCertificate() {
  const [serialNumber, setSerialNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState([]); // Store certificate details
  const [verificationAttempted, setVerificationAttempted] = useState(false); // Track if verification has been attempted

  const handleInputChange = (event) => {
    setSerialNumber(event.target.value);
  };

  const fetchCertificateData = async () => {
    try {
      const { accounts, contract } = await getBlockchain();
      // Fetch certificate data from the blockchain
      const certificate = await contract.methods.getCertificate(serialNumber).call();

      if (certificate) {
        const newCertificate = {
          serialNumber,
          name: certificate[1] || "",
          cid: certificate[2] || "",
        };

        // Replace the previous certificate with the new one
        setCertificateDetails([newCertificate]);
      } else {
        setCertificateDetails([]); // No certificate found, so clear any previous data
        setErrorMessage("Certificate not found.");
      }

      setIsLoading(false);
      setVerificationAttempted(true); // Set verification as attempted
    } catch (error) {
      setCertificateDetails([]); // Clear any data on error
      setErrorMessage("Certificate not found.");
      setIsLoading(false);
      setVerificationAttempted(true); // Set verification as attempted
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setVerificationAttempted(false); // Reset verification flag before starting new attempt
    await fetchCertificateData(); // Call the existing function to fetch data
  };

  // Table columns definition
  const columns = [
    { Header: "Serial Number", accessor: "serialNumber" },
    { Header: "Name", accessor: "name" },
    {
      Header: "CID",
      accessor: "cid",
      Cell: Cell, // Reference the Cell component here
    },
  ];

  // Table rows data
  const rows =
    verificationAttempted && certificateDetails.length === 0
      ? [
          {
            serialNumber: "No certificate found",
            name: "",
            cid: "",
          },
        ]
      : certificateDetails.map((certificate) => ({
          serialNumber: certificate.serialNumber,
          name: certificate.name,
          cid: certificate.cid,
        }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Verify Certificate
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <MDBox mt={3}>
                    <MDInput
                      label="Enter Certificate Serial Number"
                      variant="outlined"
                      fullWidth
                      value={serialNumber}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleVerify}
                      sx={{ width: "100%" }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Certificate"}
                    </MDButton>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Only show the table if verification has been attempted */}
      {verificationAttempted && (
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="dark"
                  borderRadius="lg"
                  coloredShadow="info"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <MDTypography variant="h6" color="white">
                    Certificate Details
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      )}
      <Footer />
    </DashboardLayout>
  );
}

// Cell component definition
const Cell = ({ value }) => (
  <a href={`http://127.0.0.1:8080/ipfs/${value}`} target="_blank" rel="noopener noreferrer">
    {value}
  </a>
);

// Prop validation for the Cell component
Cell.propTypes = {
  value: PropTypes.string.isRequired,
};

export default VerifyCertificate;
