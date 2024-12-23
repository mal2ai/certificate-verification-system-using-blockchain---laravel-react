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
import Divider from "@mui/material/Divider";
import { FormControl, InputLabel } from "@mui/material";

// Notification components
import MDSnackbar from "components/MDSnackbar";

// Utility functions
import { uploadToIPFS } from "utils/ipfs";
import { getBlockchain } from "utils/blockchain";
import { storeTransaction, createLog } from "utils/api";

function AddCertificates() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null); // For the certificate file
  const [transcript, setTranscript] = useState(null); // For the transcript file
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Handlers
  const handleFileChange = (e) => setFile(e.target.files[0]); // For the certificate file
  const handleTranscriptChange = (e) => setTranscript(e.target.files[0]); // For the transcript file
  const handleNameChange = (e) => setName(e.target.value);
  const handleSerialNumberChange = (e) => setSerialNumber(e.target.value);
  const handleIcNumberChange = (e) => setIcNumber(e.target.value);
  const handleStudentIdChange = (e) => setStudentId(e.target.value);
  const handleCourseNameChange = (e) => setCourseName(e.target.value);
  const handleIssuedDateChange = (e) => setIssuedDate(e.target.value);

  const courseOptions = [
    "Diploma Pengajian Muamalat",
    "Diploma Pengurusan Haji dan Umrah",
    "Diploma Pengurusan Industri Halal",
    "Diploma Zakat dan Wakaf",
    "Diploma Syariah Islamiyah",
    "Diploma Teknologi Maklumat (DITe)",
    "Diploma in Business Administration",
    "Diploma Perakaunan",
    "Diploma Kaunseling Islam",
    "Sijil Aplikasi Muamalat (SAM)",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Step 1: Validate if the required fields are filled
    if (
      !serialNumber ||
      !name ||
      !file ||
      !icNumber ||
      !studentId ||
      !courseName ||
      !issuedDate ||
      !transcript
    ) {
      setStatusMessage(
        "Please fill in all required fields, including both the certificate and transcript files."
      );
      setLoading(false);
      return; // Stop the function if any required field is missing
    }

    try {
      // Step 2: Hash the certificate file
      const certificateHash = await generateFileHash(file);
      console.log("Generated hash for the certificate file:", certificateHash);

      // Step 3: Upload certificate PDF to IPFS
      const certificateCID = await uploadToIPFS(file);
      console.log("Uploaded certificate to IPFS, CID:", certificateCID);

      // Step 4: Upload transcript PDF to IPFS (without hashing)
      const transcriptCID = await uploadToIPFS(transcript);
      console.log("Uploaded transcript to IPFS, CID:", transcriptCID);

      // Step 5: Register certificate on blockchain with the certificate hash, certificate CID, and transcript CID
      const { adminAccount, contract } = await getBlockchain();
      const receipt = await contract.methods
        .registerCertificate(
          serialNumber,
          name,
          certificateCID,
          icNumber,
          studentId,
          courseName,
          issuedDate,
          certificateHash, // Include certificate hash
          transcriptCID // Include transcript CID
        )
        .send({
          from: adminAccount, // Use adminAccount here
          gas: 3000000, // Set an appropriate gas limit
        });

      // Prepare receipt data for backend
      const transactionData = {
        transactionHash: receipt.transactionHash || "",
        from: receipt.from || "",
        to: receipt.to || "",
        blockNumber: receipt.blockNumber?.toString() || "",
        gasUsed: receipt.gasUsed?.toString() || "",
        status: receipt.status ? "Success" : "Failed",
        action: "Register",
      };

      // Step 6: Store transaction details in Laravel backend
      const token = localStorage.getItem("token"); // Retrieve token
      await storeTransaction(transactionData, token);

      // Create a log after successful registration
      const adminEmail = localStorage.getItem("email");
      const logData = {
        user_email: null,
        admin_email: adminEmail,
        action: "Register",
        module: "Certificates",
        serial_number: serialNumber,
        tx_hash: receipt.transactionHash,
        status: "Success",
      };
      await createLog(logData, token);

      // Redirect after success
      navigate("/admin/certificates", {
        state: { successMessage: "Certificate and Transcript Added Successfully!" },
      });
    } catch (error) {
      console.error("Error uploading or registering the certificate and transcript:", error);
      alert("An error occurred while uploading or registering the certificate and transcript.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate file hash
  const generateFileHash = (file) => {
    return new Promise((resolve, reject) => {
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
  };

  // Certificate upload
  useEffect(() => {
    // Initialize the fileinput plugin
    const $ = window.$;
    if ($ && $.fn.fileinput) {
      $("#input-b1").fileinput({
        browseOnZoneClick: true,
        showPreview: true,
        showUpload: false, // Disable upload button if using custom upload handlers
      });

      // Update the certificate file state when the user selects a file
      $("#input-b1").on("change", (e) => {
        setFile(e.target.files[0]); // Set the file for the certificate
      });
    }
  }, []);

  // Transcript upload
  useEffect(() => {
    // Initialize the fileinput plugin
    const $ = window.$;
    if ($ && $.fn.fileinput) {
      $("#input-b2").fileinput({
        browseOnZoneClick: true,
        showPreview: true,
        showUpload: false, // Disable upload button if using custom upload handlers
      });

      // Update the transcript file state when the user selects a file
      $("#input-b2").on("change", (e) => {
        setTranscript(e.target.files[0]); // Set the file for the transcript
      });
    }
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center" spacing={3}>
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
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
                    <MDInput
                      type="text"
                      label="IC Number"
                      fullWidth
                      value={icNumber}
                      onChange={handleIcNumberChange}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Student ID"
                      fullWidth
                      value={studentId}
                      onChange={handleStudentIdChange}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDTypography variant="body2" color="dark" sx={{ fontSize: "0.9rem" }}>
                      Course Name:
                    </MDTypography>
                    <input
                      type="text"
                      id="course_name"
                      name="course_name"
                      value={courseName}
                      onChange={handleCourseNameChange}
                      list="course-list"
                      className="form-control"
                      placeholder="Type to search..."
                      style={{
                        fontSize: "0.9rem", // Adjust the font size
                        fontWeight: "normal", // Remove bold
                      }}
                    />
                    <datalist id="course-list">
                      {courseOptions.map((course, index) => (
                        <option key={index} value={course}></option>
                      ))}
                    </datalist>
                  </MDBox>
                  <MDBox mb={2}>
                    <MDTypography variant="body2" color="dark" sx={{ fontSize: "0.9rem" }}>
                      Issued Date:
                    </MDTypography>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={issuedDate}
                      onChange={handleIssuedDateChange}
                      style={{
                        fontSize: "0.9rem", // Adjust the font size
                        fontWeight: "normal", // Remove bold
                      }}
                    />
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>

          {/* transcript Upload Section */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
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
                  Upload Certificate
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <input
                      id="input-b1"
                      name="input-b1"
                      type="file"
                      className="file"
                      data-show-preview="false"
                    />
                  </MDBox>
                </form>
              </MDBox>
            </Card>
            <Card sx={{ marginTop: 5 }}>
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
                  Upload Transcript
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <input
                      id="input-b2"
                      name="input-b2"
                      type="file"
                      className="file"
                      data-show-preview="false"
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
