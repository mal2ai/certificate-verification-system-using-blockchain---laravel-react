import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/Lock";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// API function to get status by email
import { getStatusByEmail } from "utils/api";
import { verifyOTP } from "utils/api";

// Notification
import MDSnackbar from "components/MDSnackbar";

function Status() {
  const navigate = useNavigate();

  // State to hold the status data
  const [statusData, setStatusData] = useState([]);

  // State to manage loading state
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Notification state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState(""); // "success" or "error"

  // OTP Modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Get the email from localStorage
  const email = localStorage.getItem("email");

  // Fetch status data when the component mounts
  useEffect(() => {
    if (email) {
      const fetchStatus = async (isInitialLoad = false) => {
        if (isInitialLoad) {
          setLoading(true); // Show spinner only on the first load
        }

        try {
          const response = await getStatusByEmail(email, localStorage.getItem("token"));

          if (response && response.data) {
            let sortedData = response.data;

            if (sortedData.length > 0) {
              sortedData = sortedData.sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at); // Sorting by timestamp in descending order
              });
            } else {
              sortedData = [{ status: "No request", name: "", email: "", serial_number: "" }];
            }

            setStatusData(sortedData);
          }
        } catch (error) {
          setSnackbarMessage("Failed to fetch status data!");
          setSnackbarType("error");
        } finally {
          if (isInitialLoad) {
            setLoading(false); // Hide spinner only on first load
          }
        }
      };

      // Initial fetch with loading indicator
      fetchStatus(true);

      // Set interval to fetch data every 10 seconds (without triggering the spinner)
      const intervalId = setInterval(() => fetchStatus(false), 10000);

      // Cleanup function to clear interval when component unmounts
      return () => clearInterval(intervalId);
    }
  }, [email]);

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Close OTP modal
  const handleCloseOtpModal = () => {
    setOtpModalOpen(false);
    setOtpCode("");
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    setSnackbarMessage("");
    setSnackbarType("");

    // Extract email and id from the selected row
    const { email, id, serial_number, created_at, file_hash } = selectedRow;

    if (!otpCode.trim()) {
      setSnackbarMessage("Please enter the OTP code.");
      setSnackbarType("error");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await verifyOTP(email, otpCode, id, token);

      if (response.status === 200) {
        setSnackbarMessage(response.data.message || "OTP Verified Successfully.");
        setSnackbarType("success");
        setOpenSnackbar(true);

        setIsOtpModalOpen(false); // Close modal

        navigate("/view-certificate", {
          state: { id, email, serial_number, created_at, file_hash },
        });
      } else {
        setSnackbarMessage(response.data.message || "Invalid OTP. Please try again.");
        setSnackbarType("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Invalid OTP. Please try again.");
      setSnackbarType("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle View button click (Open OTP Modal)
  const handleView = (rowData) => {
    if (rowData.status === "approved") {
      setSelectedRow(rowData);
      setOtpModalOpen(true);
    } else {
      setSnackbarMessage(
        <>
          Your request has not been approved yet <br /> or has been rejected.
        </>
      );
      setSnackbarType("error");
      setOpenSnackbar(true);
    }
  };

  const handleNewVerify = () => {
    navigate("/add-verify");
  };

  // Handle Edit button click
  const handleEdit = (rowData) => {
    navigate(`/edit-verify`, { state: { rowData } });
  };

  // Table columns
  const columns = [
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    {
      Header: "Serial Number / File Hash",
      accessor: "serial_number",
      Cell: ({ row }) => {
        const serialNumber = row.original.serial_number;
        const fileHash = row.original.file_hash;

        // Truncate fileHash if serialNumber is empty
        const truncatedHash = fileHash
          ? `${fileHash.substring(0, 6)}...${fileHash.substring(fileHash.length - 6)}`
          : "";

        return (
          serialNumber || (
            <span title={fileHash} style={{ cursor: "pointer", color: "#94849d" }}>
              {truncatedHash}
            </span>
          )
        );
      },
    },
    { Header: "Status", accessor: "status" },
    {
      Header: "Timestamp",
      accessor: "updated_at",
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => {
        if (!row.original.email || row.original.isPlaceholder) {
          return null; // Hide buttons for empty rows
        }

        return (
          <div>
            <MDButton
              variant="outlined"
              color="info"
              onClick={() => handleEdit(row.original)}
              style={{ marginRight: "10px" }}
              size="small"
              disabled={row.original.status === "approved" || row.original.status === "rejected"}
            >
              Edit
            </MDButton>

            <MDButton
              variant="outlined"
              color="success"
              onClick={() => {
                setSelectedRow(row.original);
                setIsOtpModalOpen(true);
              }}
              size="small"
              disabled={row.original.status === "pending" || row.original.status === "rejected"}
            >
              View
            </MDButton>
          </div>
        );
      },
    },
  ];

  // Function to format the date
  const formatDate = (dateString) => {
    if (!dateString) return "-"; // Return "-" if no date exists

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // Return "-" if the date is invalid

    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-GB", options);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                  Status
                </MDTypography>
                <MDButton variant="gradient" color="success" onClick={handleNewVerify}>
                  New Verify
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                    <CircularProgress />
                  </div>
                ) : (
                  <DataTable
                    table={{
                      columns,
                      rows:
                        statusData.length > 0
                          ? statusData
                          : [
                              {
                                name: "No Request Yet",
                                email: "-",
                                serial_number: "-",
                                status: "-",
                                updated_at: "-",
                                actions: "-",
                                isPlaceholder: true, // Custom flag for placeholder row
                              },
                            ],
                    }}
                    isSorted={true}
                    entriesPerPage={true}
                    showTotalEntries={true}
                    canSearch={true}
                    noEndBorder
                    customRenderRow={(row) =>
                      row.isPlaceholder ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            style={{
                              textAlign: "center",
                              padding: "20px",
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: "#888",
                            }}
                          >
                            No Request Yet
                          </td>
                        </tr>
                      ) : null
                    }
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <Dialog
          open={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          maxWidth="sm" // Set a reasonable max width (options: 'xs', 'sm', 'md', 'lg', 'xl')
          fullWidth // Ensures it takes the full width of the maxWidth
          sx={{ "& .MuiDialog-paper": { width: "500px", height: "300px" } }} // Adjust width & height
        >
          <DialogTitle>
            <LockIcon /> Enter OTP Code
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: "center" }}>
              Please enter the one-time password (OTP) code sent to your email to verify your
              identity.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Please insert OTP code (numbers only)"
              type="text" // Use text to remove spinner
              fullWidth
              variant="outlined"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  // Only allow numbers (no letters or special characters)
                  setOtpCode(value);
                }
              }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} // Ensure only numbers
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsOtpModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => handleVerifyOtp()}
              variant="contained"
              disabled={!otpCode.trim()}
              sx={{
                backgroundColor: (theme) => theme.palette.primary, // Use theme color
                color: "white !important", // Force text color to stay white
                "&:hover": { backgroundColor: (theme) => theme.palette.secondary.dark }, // Adjust hover color
              }}
            >
              Verify
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar Notification */}
      <MDSnackbar
        color={snackbarType}
        icon={snackbarType === "success" ? "check" : "warning"}
        title="Notification"
        content={snackbarMessage}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        close={() => setOpenSnackbar(false)}
        bgWhite
      />
    </DashboardLayout>
  );
}

Status.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      serial_number: PropTypes.string.isRequired,
      file_hash: PropTypes.string, // Added file_hash validation
      status: PropTypes.string.isRequired,
      rejectLoading: PropTypes.bool, // Boolean for loading state
      approveLoading: PropTypes.bool, // Boolean for loading state
      isPlaceholder: PropTypes.bool, // Added validation for placeholder row
    }).isRequired,
  }).isRequired,
  value: PropTypes.string.isRequired, // Ensure value is validated
};

export default Status;
