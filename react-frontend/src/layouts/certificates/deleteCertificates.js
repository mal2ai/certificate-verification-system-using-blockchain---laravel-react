import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Material UI Table components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// Utility to interact with blockchain
import { getBlockchain } from "utils/blockchain";

function DeleteCertificate() {
  const { serialNumber } = useParams();
  const navigate = useNavigate();

  // States to hold certificate data and loading state
  const [name, setName] = useState("");
  const [cid, setCid] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch certificate data using the serial number
  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const { accounts, contract } = await getBlockchain();

        // Fetch certificate details using serialNumber
        const certificate = await contract.methods.getCertificate(serialNumber).call();

        if (certificate) {
          setName(certificate[1] || ""); // Name is at index 1
          setCid(certificate[2] || ""); // CID is at index 2
        }

        setIsLoading(false);
      } catch (error) {
        alert("Error fetching certificate details.");
        setIsLoading(false);
      }
    };

    fetchCertificateData();
  }, [serialNumber]);

  // Handle certificate deletion
  const handleDelete = async () => {
    try {
      // Get blockchain data (accounts and contract)
      const { accounts, contract, web3 } = await getBlockchain();

      // Get the first account to send the transaction (can be changed if needed)
      const account = accounts[0];

      // Estimate gas for the transaction to get the appropriate gas limit
      const gasEstimate = await contract.methods
        .deleteCertificate(serialNumber)
        .estimateGas({ from: account });

      // Convert the gas estimate to a number
      const gasLimit = parseInt(gasEstimate, 10); // Use parseInt to convert BigInt to a number

      // Call the deleteCertificate function from the smart contract with the gas limit
      await contract.methods.deleteCertificate(serialNumber).send({
        from: account,
        gas: gasLimit * 2, // Increase gas by 2x the estimated gas limit
      });

      console.log(`Certificate with serial number ${serialNumber} deleted`);

      // After successful deletion, navigate to the certificates page and pass the success message
      navigate("/certificates", { state: { successMessage: "Certificate Deleted Successfully!" } });
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Failed to delete certificate. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Are you sure you want to delete this certificate?
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                {isLoading ? (
                  <MDTypography variant="h6" align="center">
                    Loading certificate details...
                  </MDTypography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <strong>Serial Number</strong>
                          </TableCell>
                          <TableCell>{serialNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Name</strong>
                          </TableCell>
                          <TableCell>{name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>CID</strong>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`http://127.0.0.1:8080/ipfs/${cid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {cid}
                            </a>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                pt={4}
                pb={4}
                px={3}
              >
                <MDBox display="flex" justifyContent="space-between" width="100%" sx={{ mb: 2 }}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => navigate("/certificates")}
                    sx={{ width: "48%", marginRight: "4%" }}
                  >
                    Cancel
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="error"
                    onClick={handleDelete}
                    sx={{ width: "48%" }}
                  >
                    Yes, Delete
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default DeleteCertificate;
