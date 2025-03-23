import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  storeStatus,
  getProfileDetails,
  createLog,
  storeBySerialNumber,
  storeByFileHash,
} from "utils/api"; // Import the API functions

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

import { getBlockchain } from "utils/blockchain";

function VerifyCertificate() {
  const navigate = useNavigate();
  const [serialNumber, setSerialNumber] = useState(""); // State for serial number
  const [name, setName] = useState(""); // State for name
  const [email, setEmail] = useState(""); // State for email
  const [icNumber, setIcNumber] = useState(""); // State for IC number
  const [file, setFile] = useState(null); // State for uploaded file
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button
  const [statusMessage, setStatusMessage] = useState(""); // Success/error status message

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const token = localStorage.getItem("token"); // Get the token from localStorage

      if (!token) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/sign-in"); // Redirect to login if token is not available
        return;
      }

      try {
        const response = await getProfileDetails(token);
        setName(response.data.data.name);
        setEmail(response.data.data.email);
      } catch (error) {
        console.error("Failed to fetch profile details:", error);
        setStatusMessage("Unable to retrieve user details. Please try again later.");
      }
    };

    fetchProfileDetails();
  }, [navigate]);

  // Function to handle the verify button click and store status
  const handleVerify = async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    setIsLoading(true);
    setErrorMessage("");

    // Check if required fields are empty
    if (!name || !serialNumber || !icNumber) {
      setStatusMessage("Please fill in all required fields and upload a file.");
      setIsLoading(false);
      return;
    }

    try {
      const { userAccount, contract } = await getBlockchain();
      let status = "pending"; // Default status

      // Check if the certificate exists in the blockchain
      try {
        await contract.methods.verifyCertificate(serialNumber).send({
          from: userAccount,
          gas: 3000000,
        });
        console.log("Method Call: verifyCertificate - Serial Number Found");
      } catch (error) {
        console.error("Certificate not found in blockchain.");
        setErrorMessage("Certificate not found.");
        setIsLoading(false);
        status = "not found"; // Update status if certificate doesn't exist
      }

      // Prepare data to send in the API request
      const data = {
        name,
        email,
        serial_number: serialNumber,
        ic_number: icNumber,
        status: status, // Set the status based on verification result
      };

      const token = localStorage.getItem("token");

      // Call storeBySerialNumber API function and get the response
      const response = await storeBySerialNumber(data, token);

      // Extract the ID from the response
      const requestId = response.data.data.id; // Ensure response contains the new request ID

      if (!requestId) {
        throw new Error("Request ID not found in response.");
      }

      setStatusMessage("Status stored successfully.");

      const fileHash = null; // if no file hash for this request

      // Create a log after successful request
      const userEmail = localStorage.getItem("email");
      const logData = {
        req_id: requestId, // Use the retrieved request ID
        user_email: userEmail,
        action: "New Request",
        module: "User",
        serial_number: serialNumber,
        file_hash: fileHash,
        status: "Success",
      };
      await createLog(logData, token);

      // Navigate based on role
      const role = localStorage.getItem("role");
      if (role === "admin") {
        navigate("/admin/request", { state: { successMessage: "Request Sent Successfully!" } });
      } else if (role === "user") {
        navigate("/status", { state: { successMessage: "Request Sent Successfully!" } });
      } else {
        navigate("/login");
      }
    } catch (error) {
      setStatusMessage("Failed to store status.");
      console.error("Failed to store status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change for any field
  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  // Function to calculate file hash using SHA-256
  const hashFile = async (file) => {
    const hash = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const buffer = reader.result; // File as ArrayBuffer
          const hashBuffer = await crypto.subtle.digest("SHA-256", buffer); // Generate SHA-256 hash
          const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert ArrayBuffer to byte array
          const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join(""); // Convert byte array to hex string
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
    });
    return hash;
  };

  const handleVerifyByHash = async (event) => {
    event.preventDefault();
    console.log("Submit button clicked");
    setIsLoading(true);
    setErrorMessage("");

    // Check if required fields are empty
    if (!file) {
      setStatusMessage("Please fill in all required fields and upload a file.");
      setIsLoading(false);
      return;
    }

    try {
      // Hash the file before sending the request
      const fileHash = await hashFile(file);
      const { userAccount, contract } = await getBlockchain();
      let status = "pending"; // Default status

      // Check if the certificate exists in the blockchain using file hash
      try {
        await contract.methods.verifyCertificateByHash(fileHash).send({
          from: userAccount,
          gas: 3000000,
        });
        console.log("Method Call: verifyCertificateByHash - File Hash Found");
      } catch (error) {
        console.error("Certificate not found in blockchain.");
        setErrorMessage("Certificate not found.");
        setIsLoading(false);
        status = "not found"; // Update status if certificate doesn't exist
      }

      // Prepare data to send in the API request
      const data = {
        name,
        email,
        file_hash: fileHash, // Add the file hash
        status: status, // Set the status based on verification result
      };

      const token = localStorage.getItem("token");

      // Call storeByFileHash API function
      const response = await storeByFileHash(data, token);

      const requestId = response.data.data.id;

      setStatusMessage("Status stored successfully.");

      // Create a log after successful request
      const userEmail = localStorage.getItem("email");
      const logData = {
        req_id: requestId,
        user_email: userEmail,
        action: "New Request",
        module: "User",
        file_hash: fileHash,
        status: "Success",
      };
      await createLog(logData, token);

      // Navigate based on role
      const role = localStorage.getItem("role");
      if (role === "admin") {
        navigate("/admin/request", { state: { successMessage: "Request Sent Successfully!" } });
      } else if (role === "user") {
        navigate("/status", { state: { successMessage: "Request Sent Successfully!" } });
      } else {
        navigate("/login");
      }
    } catch (error) {
      setStatusMessage("Failed to store status.");
      console.error("Failed to store status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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

      // Attach the handleFileChange function to the file input's change event
      $("#input-b1").on("change", handleFileChange);

      // Cleanup event listener on component unmount
      return () => {
        $("#input-b1").off("change", handleFileChange);
      };
    }
  }, [handleFileChange]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center" alignItems="center">
          {/* Left Card: Certificate Details Form */}
          <Grid item xs={12} md={5}>
            <form onSubmit={handleVerify}>
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
                    Certificate Details
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
                  <MDBox mt={3}>
                    <MDInput
                      label="Your Name"
                      variant="outlined"
                      fullWidth
                      value={name}
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Your Email"
                      variant="outlined"
                      fullWidth
                      value={email}
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <MDInput
                      label="Enter IC Number"
                      variant="outlined"
                      fullWidth
                      value={icNumber}
                      onChange={(e) => handleInputChange(e, setIcNumber)}
                      sx={{ mb: 2 }}
                      required
                    />
                    <MDInput
                      label="Enter Certificate Serial Number"
                      variant="outlined"
                      fullWidth
                      value={serialNumber}
                      onChange={(e) => handleInputChange(e, setSerialNumber)}
                      sx={{ mb: 2 }}
                      required
                    />
                  </MDBox>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    type="submit"
                    sx={{
                      width: "auto",
                      display: "block",
                      marginLeft: "auto",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Send Request"}
                  </MDButton>
                </MDBox>
              </Card>
            </form>
          </Grid>

          {/* Divider with "OR" */}
          <Grid item xs={12} md={2} textAlign="center">
            <MDTypography variant="h6" fontWeight="bold">
              OR
            </MDTypography>
          </Grid>

          {/* Right Card: Upload File Form */}
          <Grid item xs={12} md={5}>
            <form onSubmit={handleVerifyByHash}>
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
                    Upload Certificate PDF File (original copy)
                  </MDTypography>
                </MDBox>
                <MDBox p={3}>
                  <MDBox mt={3}>
                    <MDBox mb={2}>
                      <input
                        id="input-b1"
                        name="input-b1"
                        type="file"
                        className="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        required
                      />
                    </MDBox>
                    <MDButton
                      variant="gradient"
                      color="dark"
                      type="submit"
                      sx={{
                        width: "auto",
                        display: "block",
                        marginLeft: "auto",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Send Request"}
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </form>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default VerifyCertificate;
