import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Material UI Table components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

// Utility to interact with blockchain
import { getBlockchain } from "utils/blockchain";
import { storeTransaction, createLog } from "utils/api";
import { Margin } from "@mui/icons-material";
import { format } from "date-fns";

function DeleteCertificate() {
  const { serialNumber } = useParams();
  const navigate = useNavigate();

  // States to hold certificate data and loading state
  const [name, setName] = useState("");
  const [cid, setCid] = useState("");
  const [icNumber, setIcNumber] = useState(""); // New state for IC Number
  const [studentId, setStudentId] = useState(""); // New state for Student ID
  const [courseName, setCourseName] = useState(""); // New state for Course Name
  const [issuedDate, setIssuedDate] = useState(""); // New state for Issued Date
  const [certHash, setCertHash] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState("");

  // Fetch certificate data using the serial number
  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const { accounts, contract } = await getBlockchain();

        // Fetch certificate details using serialNumber
        const certificate = await contract.methods.getCertificate(serialNumber).call();

        if (certificate) {
          setName(certificate[1] || ""); // Name is at index 1
          setCid(certificate[2] || ""); // CID is at index 2
          setIcNumber(certificate[3] || ""); // IC Number is at index 3
          setStudentId(certificate[4] || ""); // Student ID is at index 4
          setCourseName(certificate[5] || ""); // Course Name is at index 5
          setIssuedDate(certificate[6] || ""); // Issued Date is at index 6
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

  // Handle certificate deletion
  const handleDelete = async () => {
    try {
      // Get blockchain data (adminAccount and contract)
      const { adminAccount, contract, web3 } = await getBlockchain(); // Extract adminAccount

      // Estimate gas for the transaction to get the appropriate gas limit
      const gasEstimate = await contract.methods
        .deleteCertificate(serialNumber)
        .estimateGas({ from: adminAccount });

      // Convert the gas estimate to a number
      const gasLimit = parseInt(gasEstimate, 10); // Use parseInt to convert BigInt to a number

      // Call the deleteCertificate function from the smart contract with the gas limit
      const receipt = await contract.methods.deleteCertificate(serialNumber).send({
        from: adminAccount, // Use adminAccount instead of accounts[0]
        gas: gasLimit * 2, // Increase gas by 2x the estimated gas limit
      });

      // Prepare the transaction data
      const transactionData = {
        transactionHash: receipt.transactionHash || "",
        from: receipt.from || "",
        to: receipt.to || "",
        blockNumber: receipt.blockNumber?.toString() || "",
        gasUsed: receipt.gasUsed?.toString() || "",
        status: receipt.status ? "Success" : "Failed",
        action: "Delete",
      };

      // Step 3: Store transaction details in Laravel backend
      const token = localStorage.getItem("token");
      await storeTransaction(transactionData, token);

      // Create a log after successful registration
      const adminEmail = localStorage.getItem("email");
      const logData = {
        user_email: null,
        admin_email: adminEmail,
        action: "Delete",
        module: "Certificates",
        serial_number: serialNumber,
        tx_hash: receipt.transactionHash,
        status: "Success",
      };
      await createLog(logData, token);

      // After successful deletion, navigate to the certificates page and pass the success message
      navigate("/admin/certificates", {
        state: { successMessage: `Certificate ${serialNumber} Deleted Successfully!` },
      });
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Failed to delete certificate. Please try again.");
    }
  };

  // Format the issuedDate to 'dd/MM/yyyy, h:mm a'
  const formattedIssuedDate = issuedDate ? format(new Date(issuedDate), "dd/MM/yyyy, h:mm a") : "";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={6}>
            {" "}
            {/* Adjusting left side width */}
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="dark">
                  Are you sure you want to delete this certificate?
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                {isLoading ? (
                  <MDTypography variant="h6" align="center">
                    Loading certificate details...
                  </MDTypography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>Serial Number</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>{serialNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>Name</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>{name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>IC Number</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>{icNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>Student ID</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>{studentId}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>Course Name</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>{courseName}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>Issued Date</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>{formattedIssuedDate}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>CertCID</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <a
                              href={`http://127.0.0.1:8080/ipfs/${cid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {cid}
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>TransCID</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <a
                              href={`http://127.0.0.1:8080/ipfs/${transcript}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {cid}
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: "12px" }}>
                            <strong>File Hash</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: "12px" }}>{certHash}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                pt={4}
                pb={4}
                px={3}
              >
                <MDBox display="flex" justifyContent="space-between" width="100%" sx={{ mb: 2 }}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => navigate("/admin/certificates")}
                    sx={{ width: "48%", marginRight: "4%" }}
                  >
                    Cancel
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="error"
                    onClick={handleDelete}
                    sx={{ width: "48%" }}
                  >
                    Yes, Delete
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Right side for PDF preview */}
          <Grid item xs={12} md={6}>
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
                  Certificate PDF Preview
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {cid ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "250px", // Adjust height for smaller preview
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
                    No certificate to display.
                  </MDTypography>
                )}
              </MDBox>
            </Card>

            <Card sx={{ marginTop: 5 }}>
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
                  Transcript PDF Preview
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {cid ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      height: "250px", // Adjust height for smaller preview
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {/* Use an iframe to display the PDF from IPFS */}
                    <iframe
                      src={`http://127.0.0.1:8080/ipfs/${transcript}`}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title="Certificate PDF"
                    />
                  </div>
                ) : (
                  <MDTypography variant="body2" color="textSecondary">
                    No certificate to display.
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

export default DeleteCertificate;
