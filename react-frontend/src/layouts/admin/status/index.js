import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";

// API function to get all statuses and update status
import { getAllStatuses, updateStatus, sendOTP, createLog } from "utils/api";

// Material-UI loading spinner
import CircularProgress from "@mui/material/CircularProgress";

// Notification
import MDSnackbar from "components/MDSnackbar";

function Status() {
  const navigate = useNavigate();
  const location = useLocation();

  // State to hold the status data
  const [statusData, setStatusData] = useState([]);

  // State to manage loading state
  const [loading, setLoading] = useState(false);

  // Notification state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState(""); // "success" or "error"

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  // Columns for the DataTable
  const columns = [
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Serial Number", accessor: "serial_number" },
    { Header: "Status", accessor: "status" },
    {
      Header: "Timestamp",
      accessor: "updated_at",
      Cell: ({ value }) => {
        // Malaysia timezone offset (GMT+8)
        const options = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kuala_Lumpur",
        };
        return new Intl.DateTimeFormat("en-MY", options).format(new Date(value));
      },
    },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <div>
          {/* Reject button */}
          <MDButton
            variant="outlined"
            color="error"
            onClick={() => handleReject(row.original)}
            style={{ marginRight: "10px" }}
            size="small"
            disabled={
              row.original.status === "approved" ||
              row.original.status === "rejected" ||
              row.original.rejectLoading
            }
          >
            {row.original.rejectLoading ? <CircularProgress size={24} color="inherit" /> : "Reject"}
          </MDButton>

          {/* Approve button */}
          <MDButton
            variant="outlined"
            color="success"
            onClick={() => handleApprove(row.original)}
            style={{ marginRight: "10px" }}
            size="small"
            disabled={
              row.original.status === "approved" ||
              row.original.status === "rejected" ||
              row.original.approveLoading
            }
          >
            {row.original.approveLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Approve"
            )}
          </MDButton>

          {/* Info button */}
          <MDButton
            variant="outlined"
            color="info"
            onClick={() => handleInfo(row.original)}
            size="small"
          >
            Info
          </MDButton>
        </div>
      ),
    },
  ];

  // Fetch all status data when the component mounts
  useEffect(() => {
    const fetchStatuses = async () => {
      setLoading(true);

      try {
        const response = await getAllStatuses(localStorage.getItem("token"));

        if (response && response.data) {
          // Check if the response contains the "No statuses found" message
          if (response.data.message === "No statuses found") {
            setStatusData([]); // Set the status data to an empty array
          } else {
            // Initialize rejectLoading and approveLoading for each row
            const dataWithLoading = response.data.map((item) => ({
              ...item,
              rejectLoading: false, // Initialize rejectLoading for each row
              approveLoading: false, // Initialize approveLoading for each row
            }));

            setStatusData(dataWithLoading); // Set the valid data with the loading properties
          }
        } else {
          setStatusData([]); // If there's no data in the response, set it to an empty array
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Handle the 404 status code without showing an error notification
          console.log("No statuses found (404)");
          setStatusData([]); // Set empty status data
        } else {
          // Only show an error notification for other errors
          setSnackbarMessage("Failed to fetch status data!");
          setSnackbarType("error");
          setOpenSnackbar(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  // Handle success message if present in the location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarType("success");
      setOpenSnackbar(true);

      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Handle Verify button click
  const handleVerify = () => {
    navigate("/add-verify");
  };

  const handleInfo = (rowData) => {
    navigate(`/admin/view-request`, {
      state: {
        name: rowData.name,
        email: rowData.email,
        serial_number: rowData.serial_number,
        status: rowData.status,
        created_at: rowData.created_at,
      },
    });
  };

  // Handle View button click
  // const handleView = (rowData) => {
  //   if (rowData.status === "approved") {
  //     navigate(`/view-certificate`, {
  //       state: {
  //         name: rowData.name,
  //         email: rowData.email,
  //         serial_number: rowData.serial_number,
  //         status: rowData.status,
  //       },
  //     });
  //   } else {
  //     setSnackbarMessage("Your request has not been approved yet or has been rejected.");
  //     setSnackbarType("error");
  //     setOpenSnackbar(true);
  //   }
  // };

  // Handle Reject button click
  const handleReject = async (rowData) => {
    const token = localStorage.getItem("token");
    const updatedStatus = { status: "rejected" };

    // Set loading state for Reject button only
    setStatusData((prevData) =>
      prevData.map((item) =>
        item.serial_number === rowData.serial_number && item.email === rowData.email
          ? { ...item, rejectLoading: true } // Set rejectLoading to true for this row
          : item
      )
    );

    try {
      const response = await updateStatus(
        rowData.serial_number,
        rowData.email,
        updatedStatus,
        token
      );

      if (response.data) {
        setStatusData((prevData) =>
          prevData.map((item) =>
            item.serial_number === rowData.serial_number && item.email === rowData.email
              ? { ...item, status: "rejected", rejectLoading: false } // Stop reject loading
              : item
          )
        );
        setSnackbarMessage("Request has been rejected successfully.");
        setSnackbarType("success");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Failed to reject the request.");
      setSnackbarType("error");
      setOpenSnackbar(true);
      // Stop reject loading if there was an error
      setStatusData((prevData) =>
        prevData.map((item) =>
          item.serial_number === rowData.serial_number && item.email === rowData.email
            ? { ...item, rejectLoading: false }
            : item
        )
      );
    }
  };

  const handleApprove = async (rowData) => {
    const token = localStorage.getItem("token");
    const updatedStatus = { status: "approved" };

    console.log("Approving row:", rowData);

    // Set loading state for the specific row
    setStatusData((prevData) =>
      prevData.map((item) => (item.id === rowData.id ? { ...item, approveLoading: true } : item))
    );

    try {
      // Update status using ID instead of serial_number
      const response = await updateStatus(rowData.id, rowData.email, updatedStatus, token);

      if (response?.data) {
        const otpResponse = await sendOTP(rowData.email, rowData.id, token);

        if (otpResponse?.data) {
          setSnackbarMessage("Request approved and OTP sent successfully.");
          setSnackbarType("success");
          setOpenSnackbar(true);

          // Update the specific row's status and loading state
          setStatusData((prevData) =>
            prevData.map((item) =>
              item.id === rowData.id ? { ...item, status: "approved", approveLoading: false } : item
            )
          );
          return;
        }
      }

      throw new Error("Failed to send OTP");
    } catch (error) {
      console.error("Error in handleApprove:", error);

      setSnackbarMessage("Failed to approve the request or send OTP.");
      setSnackbarType("error");
      setOpenSnackbar(true);

      // Ensure approveLoading is set to false in case of failure
      setStatusData((prevData) =>
        prevData.map((item) => (item.id === rowData.id ? { ...item, approveLoading: false } : item))
      );
    }
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
                  Verify Request
                </MDTypography>
                <MDButton variant="gradient" color="success" onClick={handleVerify}>
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
                    table={{ columns, rows: statusData }}
                    isSorted={true}
                    entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20, 25] }}
                    showTotalEntries={true}
                    canSearch={true}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <MDSnackbar
        color={snackbarType}
        icon={snackbarType === "success" ? "check_circle" : "error"}
        title={snackbarType === "success" ? "Success" : "Error"}
        content={snackbarMessage}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        closeColor="white"
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
      status: PropTypes.string.isRequired,
      rejectLoading: PropTypes.bool, // Add rejectLoading as a boolean
      approveLoading: PropTypes.bool, // Add approveLoading as a boolean
    }).isRequired,
  }).isRequired,
};

export default Status;
