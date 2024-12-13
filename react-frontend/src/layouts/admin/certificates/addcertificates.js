import React, { useState, useEffect } from "react";
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

// Notification components
import MDSnackbar from "components/MDSnackbar";

// Utility functions
import { uploadToIPFS } from "utils/ipfs";
import { getBlockchain } from "utils/blockchain";

function AddCertificates() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleNameChange = (e) => setName(e.target.value);
  const handleSerialNumberChange = (e) => setSerialNumber(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Step 1: Validate if the required fields are filled
    if (!serialNumber || !name || !file) {
      setStatusMessage("Please fill in all required fields (Name, Serial Number, and File).");
      setLoading(false);
      return; // Stop the function if any required field is missing
    }

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

      // Redirect after success
      navigate("/admin/certificates", {
        state: { successMessage: "Certificate Added Successfully!" },
      });
    } catch (error) {
      console.error("Error uploading or registering the certificate:", error);
      alert("An error occurred while uploading or registering the certificate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize the fileinput plugin
    const $ = window.$;
    if ($ && $.fn.fileinput) {
      $("#input-b1").fileinput({
        browseOnZoneClick: true,
        showPreview: true,
        showUpload: false, // Disable upload button if using custom upload handlers
      });

      // Update the file state when the user selects a file
      $("#input-b1").on("change", (e) => {
        setFile(e.target.files[0]);
      });
    }
  }, []);

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
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="dark">
                  Add Certificate
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {statusMessage && (
                  <MDBox mt={2}>
                    <MDTypography
                      variant="body2"
                      color={statusMessage.includes("successfully") ? "green" : "red"}
                    >
                      {statusMessage}
                    </MDTypography>
                  </MDBox>
                )}
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
                    <MDTypography variant="body2" color="dark">
                      Upload Certificate:
                    </MDTypography>
                    <input id="input-b1" name="input-b1" type="file" className="file" />
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
