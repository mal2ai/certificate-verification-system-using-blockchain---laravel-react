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
import { storeTransaction, createLog } from "utils/api";

function EditCertificate() {
  const navigate = useNavigate();
  const { serialNumber } = useParams(); // Fetch the serial number from URL params
  const [file, setFile] = useState(null);
  const [name, setName] = useState(""); // Default to an empty string for the name
  const [cid, setCid] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state for data fetching
  const [icNumber, setIcNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [certHash, setCertHash] = useState("");
  const [transcript, setTranscript] = useState("");
  const [transcriptFile, setTranscriptFile] = useState("");

  const handleCourseNameChange = (e) => setCourseName(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleNameChange = (e) => setName(e.target.value);
  const handleTranscriptChange = (e) => {
    const file = e.target.files[0];
    setTranscriptFile(file); // Store the file object temporarily
  };

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

  // Fetch existing certificate data using the serialNumber
  useEffect(() => {
    if (!serialNumber) {
      console.error("Serial Number is missing.");
      return;
    }

    const fetchCertificateData = async () => {
      try {
        const { accounts, contract } = await getBlockchain();

        const certificate = await contract.methods.getCertificate(serialNumber).call();

        if (certificate) {
          setName(certificate[1] || "");
          setCid(certificate[2] || "");
          setIcNumber(certificate[3] || "");
          setStudentId(certificate[4] || "");
          setCourseName(certificate[5] || "");
          setIssuedDate(certificate[6] || "");
          setCertHash(certificate[7] || "");
          setTranscript(certificate[8] || "");
        }

        setIsLoading(false);
      } catch (error) {
        alert("Error fetching certificate details.");
        setIsLoading(false);
      }
    };

    fetchCertificateData();
  }, [serialNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let ipfsCID = cid; // Default CID if no new certificate file is uploaded
      let fileHash = certHash; // Default file hash if no new certificate file is uploaded
      let transcriptCID = transcript; // Default CID if no new transcript file is uploaded

      if (file) {
        // Handle certificate file upload (same as before)
        fileHash = await new Promise((resolve, reject) => {
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

        console.log("Hashed certificate file:", fileHash);

        // Upload certificate file to IPFS
        ipfsCID = await uploadToIPFS(file);
        console.log("Uploaded certificate to IPFS, CID:", ipfsCID);
      }

      if (transcriptFile) {
        // Upload the transcript file to IPFS and get the CID
        transcriptCID = await uploadToIPFS(transcriptFile);
        console.log("Uploaded transcript to IPFS, CID:", transcriptCID);
        setTranscript(transcriptCID); // Update the `transcript` state with the new CID
      }

      // Step 3: Update the certificate on blockchain with the updated file hashes and CIDs
      const { adminAccount, contract, web3 } = await getBlockchain();
      const receipt = await contract.methods
        .updateCertificate(
          serialNumber,
          name,
          ipfsCID,
          icNumber,
          studentId,
          courseName,
          issuedDate,
          fileHash,
          transcriptCID // Include transcript CID here
        )
        .send({
          from: adminAccount,
          gas: 3000000,
        });

      // Store transaction details in the backend
      const transactionData = {
        transactionHash: receipt.transactionHash || "",
        from: receipt.from || "",
        to: receipt.to || "",
        blockNumber: receipt.blockNumber?.toString() || "",
        gasUsed: receipt.gasUsed?.toString() || "",
        status: receipt.status ? "Success" : "Failed",
        action: "Update",
      };

      // Store transaction in the backend
      const token = localStorage.getItem("token");
      await storeTransaction(transactionData, token);

      // Create a log after successful registration
      const adminEmail = localStorage.getItem("email");
      const logData = {
        user_email: null,
        admin_email: adminEmail,
        action: "Update",
        module: "Certificates",
        serial_number: serialNumber,
        tx_hash: receipt.transactionHash,
        status: "Success",
      };
      await createLog(logData, token);

      // After successful update, navigate to certificates page
      navigate("/admin/certificates", {
        state: { successMessage: "Certificate and Transcript Updated Successfully!" },
      });
    } catch (error) {
      console.error("Error updating certificate and transcript:", error);
      alert("An error occurred while updating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center" spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ marginTop: 2 }}>
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
                  Update Certificate
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
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="IC Number"
                      fullWidth
                      value={isLoading ? "Loading..." : icNumber}
                      onChange={(e) => setIcNumber(e.target.value)}
                      disabled={isLoading} // Prevent editing during loading
                    />
                  </MDBox>

                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Student ID"
                      fullWidth
                      value={isLoading ? "Loading..." : studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={isLoading} // Prevent editing during loading
                    />
                  </MDBox>

                  <MDBox mb={3}>
                    <MDTypography variant="body2" color="dark" sx={{ fontSize: "0.9rem" }}>
                      Course Name:
                    </MDTypography>
                    <input
                      type="text"
                      id="course_name"
                      name="course_name"
                      value={isLoading ? "Loading..." : courseName}
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
                    <MDInput
                      type="datetime-local"
                      label="Issued Date"
                      fullWidth
                      value={isLoading ? "Loading..." : issuedDate}
                      onChange={(e) => setIssuedDate(e.target.value)}
                      disabled={isLoading} // Prevent editing during loading
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="File Hash"
                      fullWidth
                      value={isLoading ? "Loading..." : certHash}
                      onChange={(e) => setCertHash(e.target.value)}
                      disabled={isLoading} // Prevent editing during loading
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDTypography variant="body2" color="dark" sx={{ fontSize: "0.9rem" }}>
                      Upload new certificate:
                    </MDTypography>
                    <MDInput type="file" fullWidth onChange={handleFileChange} />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDTypography variant="body2" color="dark" sx={{ fontSize: "0.9rem" }}>
                      Upload new transcript:
                    </MDTypography>
                    <MDInput type="file" fullWidth onChange={handleTranscriptChange} />
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

          {/* Right side panel */}
          <Grid item xs={12} md={6} sx={{ marginTop: 2 }}>
            {/* Certificate PDF Preview Card */}
            <Card>
              <MDBox
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="dark">
                  Existing Certificate PDF
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {cid ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "250px", // Reduced height for a smaller preview
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {/* Use an iframe to display the PDF from IPFS */}
                    <iframe
                      src={`http://127.0.0.1:8080/ipfs/${cid}`}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="Certificate PDF"
                    />
                  </div>
                ) : (
                  <MDTypography variant="body2" color="textSecondary">
                    No certificate data to display.
                  </MDTypography>
                )}
              </MDBox>
            </Card>

            {/* Transcript PDF Preview Card */}
            <Card sx={{ marginTop: 6 }}>
              <MDBox
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="dark">
                  Existing Transcript PDF
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {transcript ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "250px", // Adjusted height for the preview
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <iframe
                      src={`http://127.0.0.1:8080/ipfs/${transcript}`} // Use the CID here
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="Transcript PDF"
                    />
                  </div>
                ) : (
                  <MDTypography variant="body2" color="textSecondary">
                    No transcript data to display.
                  </MDTypography>
                )}
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
