import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeStatus, getProfileDetails } from "utils/api"; // Import the API functions

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

  // Function to handle the verify button click and store status
  const handleVerify = async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    setIsLoading(true);
    setErrorMessage("");

    // Check if required fields are empty
    if (!name || !serialNumber || !icNumber || !file) {
      setStatusMessage("Please fill in all required fields and upload a file.");
      setIsLoading(false);
      return; // Stop the function if required fields or file is empty
    }

    try {
      // Hash the file before sending the request
      const fileHash = await hashFile(file);

      // Prepare data to send in the API request
      const data = {
        name,
        email,
        serial_number: serialNumber,
        ic_number: icNumber,
        file_hash: fileHash, // Add the file hash
        status: "pending", // Default status as pending
      };

      const token = localStorage.getItem("token"); // Get token from localStorage

      // Call storeStatus API function to store the status and file hash
      await storeStatus(data, token);
      setStatusMessage("Status stored successfully.");

      // Check the role from localStorage
      const role = localStorage.getItem("role"); // Get the role from localStorage

      // Conditionally navigate based on the role
      if (role === "admin") {
        navigate("/admin/request", { state: { successMessage: "Request Sent Successfully!" } });
      } else if (role === "user") {
        navigate("/status", { state: { successMessage: "Request Sent Successfully!" } });
      } else {
        // Optional: handle if role is not found (e.g., redirect to login)
        navigate("/login");
      }
    } catch (error) {
      setStatusMessage("Failed to store status.");
    } finally {
      setIsLoading(false); // Stop loading state
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
        <form onSubmit={handleVerify}>
          <Grid container spacing={3} justifyContent="center">
            {/* Left Card: Input Fields */}
            <Grid item xs={12} md={6}>
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
                </MDBox>
              </Card>
            </Grid>

            {/* Right Card: File Upload */}
            <Grid item xs={12} md={6}>
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
                    Upload File
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
            </Grid>
          </Grid>
        </form>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default VerifyCertificate;
