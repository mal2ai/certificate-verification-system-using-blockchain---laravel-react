import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

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
    if (!serialNumber) {
      console.error("Serial Number is missing.");
      return;
    }

    const fetchCertificateData = async () => {
      try {
        const { accounts, contract } = await getBlockchain();
        //console.log("Serial Number:", serialNumber); // Ensure serialNumber is being passed correctly

        const certificate = await contract.methods.getCertificate(serialNumber).call();
        //console.log("Fetched Certificate:", certificate); // Log the certificate data

        if (certificate) {
          setName(certificate[1] || ""); // Use the correct index for `name`
          setCid(certificate[2] || ""); // Use the correct index for `cid`
        }

        setIsLoading(false);
      } catch (error) {
        //console.error("Error fetching certificate details:", error);
        alert("Error fetching certificate details.");
        setIsLoading(false);
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

      navigate("/admin/certificates", {
        state: { successMessage: "Certificate Updated Successfully!" },
      });
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
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="dark">
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
                      value={isLoading ? "Loading..." : name} // Show "Loading..." until the name is fetched
                      onChange={handleNameChange}
                      disabled={isLoading} // Prevent editing during loading
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
                  <MDBox mb={2} display="flex" alignItems="center">
                    <MDTypography variant="caption" color="text">
                      Existing Certificate:
                    </MDTypography>
                    {cid ? (
                      <MDBox display="flex" alignItems="center" ml={1}>
                        <Icon
                          fontSize="small"
                          color="dark"
                          sx={{
                            cursor: "pointer",
                          }}
                          component="a"
                          href={`http://127.0.0.1:8080/ipfs/${cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          picture_as_pdf
                        </Icon>
                        <MDTypography
                          variant="button"
                          fontWeight="bold"
                          color="dark"
                          component="a"
                          href={`http://127.0.0.1:8080/ipfs/${cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ ml: 0.5 }} // Margin between icon and label
                        >
                          PDF
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <MDTypography variant="body2" color="text" ml={1}>
                        No existing certificate available.
                      </MDTypography>
                    )}
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
