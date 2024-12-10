import React, { useState } from "react";
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

// Utility functions
import { uploadToIPFS } from "utils/ipfs";
import { getBlockchain } from "utils/blockchain";

function AddCertificates() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleNameChange = (e) => setName(e.target.value);
  const handleSerialNumberChange = (e) => setSerialNumber(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Upload PDF to IPFS
      const ipfsCID = await uploadToIPFS(file);
      console.log("Uploaded to IPFS, CID:", ipfsCID);

      // Step 2: Register certificate on blockchain
      const { accounts, contract } = await getBlockchain();
      await contract.methods.registerCertificate(serialNumber, name, ipfsCID).send({
        from: accounts[0],
        gas: 3000000, // Set an appropriate gas limit
      });

      alert("Certificate registered successfully!");
    } catch (error) {
      console.error("Error uploading or registering the certificate:", error);
      alert("An error occurred while uploading or registering the certificate.");
    } finally {
      setLoading(false);
    }
  };

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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Add Certificate
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Name"
                      fullWidth
                      value={name}
                      onChange={handleNameChange}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Serial Number"
                      fullWidth
                      value={serialNumber}
                      onChange={handleSerialNumberChange}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="file"
                      label="Upload Certificate"
                      fullWidth
                      onChange={handleFileChange}
                    />
                  </MDBox>
                  <MDBox display="flex" justifyContent="flex-end">
                    <MDButton variant="gradient" color="dark" type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </MDButton>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AddCertificates;
