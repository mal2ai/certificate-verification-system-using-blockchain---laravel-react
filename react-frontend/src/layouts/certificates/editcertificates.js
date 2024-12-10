import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Utility functions
import { uploadToIPFS } from "utils/ipfs";
import { getBlockchain } from "utils/blockchain";

function EditCertificate() {
  const navigate = useNavigate();
  const { serialNumber } = useParams(); // Fetch the serial number from URL params
  const [file, setFile] = useState(null);
  const [name, setName] = useState(""); // Default to an empty string for the name
  const [cid, setCid] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state for data fetching

  // Fetch existing certificate data using the serialNumber
  useEffect(() => {
    console.log("Fetching data for Serial Number:", serialNumber); // Log serialNumber

    if (!serialNumber) {
      console.error("Serial Number is missing.");
      return;
    }

    const fetchCertificateData = async () => {
      try {
        const { accounts, contract } = await getBlockchain();
        const certificate = await contract.methods.getCertificate(serialNumber).call();
        console.log("Fetched Certificate:", certificate); // Log fetched certificate data

        if (certificate) {
          // Ensure that the name and cid are set correctly
          setName(certificate.name || ""); // Make sure name is set or default to empty string
          setCid(certificate.cid || ""); // Ensure cid is set
        }

        setIsLoading(false); // Set isLoading to false once data is loaded
      } catch (error) {
        console.error("Error fetching certificate:", error);
        alert("Error fetching certificate details.");
        setIsLoading(false); // Set isLoading to false if there's an error
      }
    };

    fetchCertificateData();
  }, [serialNumber]);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleNameChange = (e) => setName(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Upload new PDF to IPFS (if a file is selected)
      let ipfsCID = cid; // Default CID if no new file is uploaded
      if (file) {
        ipfsCID = await uploadToIPFS(file);
        console.log("Uploaded to IPFS, CID:", ipfsCID);
      }

      // Step 2: Update certificate on blockchain
      const { accounts, contract } = await getBlockchain();
      await contract.methods.updateCertificate(serialNumber, name, ipfsCID).send({
        from: accounts[0],
        gas: 3000000, // Set an appropriate gas limit
      });

      alert("Certificate updated successfully!");
      navigate("/certificates"); // Navigate to the certificates page after update
    } catch (error) {
      console.error("Error updating the certificate:", error);
      alert("An error occurred while updating the certificate. Please try again.");
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
                  Edit Certificate
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Name"
                      fullWidth
                      value={isLoading ? "Loading..." : name} // Show loading state while fetching the data, then the actual name
                      onChange={handleNameChange}
                      disabled={isLoading} // Disable the input while loading
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Serial Number"
                      fullWidth
                      value={serialNumber || "Loading..."} // Show loading placeholder
                      disabled
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="file"
                      label="Upload New Certificate"
                      fullWidth
                      onChange={handleFileChange}
                    />
                  </MDBox>
                  <MDBox display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="gradient"
                      color="dark"
                      type="submit"
                      disabled={loading || isLoading}
                    >
                      {loading ? "Updating..." : "Update"}
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

export default EditCertificate;
