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
import { storeTransaction } from "utils/api";

function AddCertificates() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);
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
    if (!serialNumber || !name || !file || !icNumber || !studentId || !courseName || !issuedDate) {
      setStatusMessage("Please fill in all required fields.");
      setLoading(false);
      return; // Stop the function if any required field is missing
    }

    try {
      // Step 1: Hash the uploaded file using the browser's SubtleCrypto API
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

      console.log("Generated hash for the file:", hash);

      // Step 2: Upload PDF to IPFS
      const ipfsCID = await uploadToIPFS(file);
      console.log("Uploaded to IPFS, CID:", ipfsCID);

      // Step 3: Register certificate on blockchain with the hash
      const { adminAccount, contract } = await getBlockchain();
      const receipt = await contract.methods
        .registerCertificate(
          serialNumber,
          name,
          ipfsCID,
          icNumber,
          studentId,
          courseName,
          issuedDate,
          hash // Include the hash in the smart contract call
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
      };

      // Step 4: Store transaction details in Laravel backend
      const token = localStorage.getItem("token"); // Retrieve token
      await storeTransaction(transactionData, token);

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

          {/* Certificate Upload Section */}
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
