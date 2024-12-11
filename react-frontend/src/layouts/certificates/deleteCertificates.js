import React from "react";
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

// Utility to interact with blockchain
import { getBlockchain } from "utils/blockchain";

function DeleteCertificate() {
  const { serialNumber } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      // Get blockchain data (accounts and contract)
      const { accounts, contract, web3 } = await getBlockchain();

      // Get the first account to send the transaction (can be changed if needed)
      const account = accounts[0];

      // Call the deleteCertificate function from the smart contract
      await contract.methods.deleteCertificate(serialNumber).send({ from: account });

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
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                pt={4}
                pb={4}
                px={3} // Adds horizontal padding to the card container
              >
                <MDTypography variant="h6" color="textPrimary" mb={3}>
                  Are you sure you want to delete this certificate?
                </MDTypography>

                <MDBox display="flex" justifyContent="space-between" width="100%" sx={{ mb: 2 }}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => navigate("/certificates")}
                    sx={{ width: "48%", marginRight: "4%" }} // Adds margin to the right of the Cancel button
                  >
                    Cancel
                  </MDButton>

                  <MDButton
                    variant="gradient"
                    color="error"
                    onClick={handleDelete}
                    sx={{ width: "48%" }} // The width of the Yes button will be reduced automatically by the margin of Cancel
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
