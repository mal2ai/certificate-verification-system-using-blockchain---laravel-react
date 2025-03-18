import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateDetailsById, createLog } from "utils/api"; // Import the updateDetails function

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

function VerifyCertificate() {
  const navigate = useNavigate();
  const location = useLocation();

  const [serialNumber, setSerialNumber] = useState("");
  const [id, setID] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [cid, setCid] = useState(""); // Added state for CID
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (location.state) {
      const { id, name, email, serial_number, ic_number, file_hash } = location.state.rowData;
      setID(id);
      setName(name);
      setEmail(email);
      setSerialNumber(serial_number);
      setIcNumber(ic_number);
      setFileHash(file_hash || ""); // Set existing file hash
      setCid(cid || ""); // Set existing CID
    }
  }, [location.state]);

  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setCertificateFile(file);

    if (file) {
      try {
        const hash = await hashFile(file);
        setFileHash(hash);
        setCid(""); // Clear the CID if a new file is uploaded
      } catch (error) {
        setErrorMessage("Failed to hash the file.");
      }
    }
  };

  const handleVerify = async (event, formType) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (formType === "updateDetails") {
      // Validate required fields for updating details
      if (!name || !serialNumber || !icNumber) {
        setStatusMessage("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }
    } else if (formType === "uploadFile") {
      // Ensure file is selected
      if (!certificateFile) {
        setStatusMessage("Please select a file to upload.");
        setIsLoading(false);
        return;
      }
    }

    let data = {
      name,
      email,
      serial_number: serialNumber,
      ic_number: icNumber,
      status: "pending",
      file_hash: fileHash,
      cid: certificateFile ? "" : cid, // Use the existing CID if no new file is uploaded
    };

    try {
      await updateDetailsById(id, data, token);
      setStatusMessage("Status updated successfully.");

      // Create a log entry
      const logData = {
        user_email: email,
        action: formType === "uploadFile" ? "Upload Certificate" : "Update Request",
        module: "User",
        serial_number: serialNumber,
        file_hash: fileHash,
        status: "Success",
      };
      await createLog(logData, token);

      navigate("/status", { state: { successMessage: "Update Successfully!" } });
    } catch (error) {
      setStatusMessage("Failed to update status.");
      console.error(error);
    } finally {
      setIsLoading(false);
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
        {!fileHash || fileHash === "N/A" ? (
          // Show Update Verify Certificate Card only if fileHash is empty
          <form onSubmit={(event) => handleVerify(event, "updateDetails")}>
            <Grid container spacing={3} justifyContent="center">
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
                      Update Verify Certificate
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
                    {errorMessage && (
                      <MDBox mt={2}>
                        <MDTypography variant="body2" color="red">
                          {errorMessage}
                        </MDTypography>
                      </MDBox>
                    )}

                    <MDBox mt={3}>
                      <MDInput
                        label="Enter Your Name"
                        variant="outlined"
                        fullWidth
                        value={name}
                        onChange={(e) => handleInputChange(e, setName)}
                        sx={{ mb: 2 }}
                        required
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Enter Your Email"
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

                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton variant="gradient" color="dark" type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "UPDATE"}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </form>
        ) : !serialNumber || serialNumber === "" ? (
          // Show Upload File Card only if serialNumber is empty
          <form onSubmit={(event) => handleVerify(event, "uploadFile")}>
            <Grid container spacing={3} justifyContent="center">
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
                        />
                      </MDBox>
                    </MDBox>

                    <MDInput
                      label="Current File Hash"
                      variant="outlined"
                      fullWidth
                      value={fileHash}
                      sx={{ mb: 2 }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />

                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton variant="gradient" color="dark" type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "UPDATE"}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </form>
        ) : (
          // Default case when both fileHash and serialNumber exist
          <form onSubmit={(event) => handleVerify(event, "both")}>
            <Grid container spacing={3} justifyContent="center">
              {/* Left Card: Update Verify Certificate */}
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
                      Update Verify Certificate
                    </MDTypography>
                  </MDBox>
                  <MDBox p={3}>
                    <MDBox mt={3}>
                      <MDInput
                        label="Enter Your Name"
                        variant="outlined"
                        fullWidth
                        value={name}
                        sx={{ mb: 2 }}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Enter Your Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        sx={{ mb: 2 }}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <MDInput
                        label="Enter IC Number"
                        variant="outlined"
                        fullWidth
                        value={icNumber}
                        onChange={(e) => handleInputChange(e, setIcNumber)}
                        sx={{ mb: 2 }}
                      />
                      <MDInput
                        label="Enter Certificate Serial Number"
                        variant="outlined"
                        fullWidth
                        value={serialNumber}
                        sx={{ mb: 2 }}
                      />
                      <MDInput
                        label="Current File Hash"
                        variant="outlined"
                        fullWidth
                        value={fileHash}
                        sx={{ mb: 2 }}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Right Card: Upload File */}
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
                        />
                      </MDBox>
                    </MDBox>
                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton variant="gradient" color="dark" type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "UPDATE"}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </form>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default VerifyCertificate;
