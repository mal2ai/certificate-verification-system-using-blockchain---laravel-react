import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Tabs, Tab } from "@mui/material";

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

  const [selectedTab, setSelectedTab] = useState(0);

  const pendingStatusData = statusData.filter((item) => item.status === "pending");
  const approvedStatusData = statusData.filter((item) => item.status === "approved");
  const rejectedStatusData = statusData.filter((item) => item.status === "rejected");
  const notFoundStatusData = statusData.filter((item) => item.status === "not found");

  const selectedRows =
    selectedTab === 0
      ? pendingStatusData
      : selectedTab === 1
      ? approvedStatusData
      : selectedTab === 2
      ? rejectedStatusData
      : notFoundStatusData;

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  // Columns for the DataTable
  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    {
      Header: "Serial Number",
      accessor: (row) => (row.serial_number ? row.serial_number : "N/A"),
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => {
        let bgColor = "";

        switch (value.toLowerCase()) {
          case "pending":
            bgColor = "#ffa700";
            break;
          case "approved":
            bgColor = "green";
            break;
          case "rejected":
            bgColor = "red";
            break;
          case "not found":
            bgColor = "gray";
            break;
          default:
            bgColor = "white";
        }

        return (
          <span
            style={{
              backgroundColor: "#f2f2f2",
              color: bgColor,
              padding: "2px 10px",
              borderRadius: "5px",
              display: "inline-block",
              fontWeight: "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
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
              row.original.status === "not found" ||
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
              row.original.status === "not found" ||
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
    const fetchStatuses = async (isFirstLoad = false) => {
      if (isFirstLoad) setLoading(true); // Show spinner only on initial load

      try {
        const response = await getAllStatuses(localStorage.getItem("token"));

        if (response && response.data) {
          if (response.data.message === "No statuses found") {
            setStatusData([]);
          } else {
            let sortedData = response.data.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at) // Sort by created_at in descending order
            );

            const dataWithLoading = sortedData.map((item) => ({
              ...item,
              rejectLoading: false,
              approveLoading: false,
            }));

            setStatusData(dataWithLoading);
          }
        } else {
          setStatusData([]);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No statuses found (404)");
          setStatusData([]);
        } else {
          setSnackbarMessage("Failed to fetch status data!");
          setSnackbarType("error");
          setOpenSnackbar(true);
        }
      } finally {
        if (isFirstLoad) setLoading(false); // Hide spinner only after first load
      }
    };

    // Fetch statuses initially (with loading)
    fetchStatuses(true);

    // Set up an interval to refresh statuses every 10 seconds (without loading)
    const interval = setInterval(() => {
      fetchStatuses(false);
    }, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
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
        id: rowData.id,
        name: rowData.name,
        email: rowData.email,
        serial_number: rowData.serial_number,
        status: rowData.status,
        created_at: rowData.created_at,
      },
    });
  };

  // Handle Reject button click
  const handleReject = async (rowData) => {
    const token = localStorage.getItem("token");
    const updatedStatus = { status: "rejected" };

    // Set loading state for the specific row being rejected
    setStatusData((prevData) =>
      prevData.map((item) =>
        item.id === rowData.id
          ? { ...item, rejectLoading: true } // Set rejectLoading to true
          : item
      )
    );

    try {
      const response = await updateStatus(rowData.id, rowData.email, updatedStatus, token);

      if (response?.data) {
        // Create a log after successful rejection
        const userEmail = localStorage.getItem("email");
        const logData = {
          req_id: rowData.id,
          admin_email: userEmail,
          user_email: rowData.email,
          action: "Rejecting",
          module: "Request",
          serial_number: rowData.serial_number || "N/A", // Use serial_number if available
          tx_hash: rowData.tx_hash || "N/A", // Use tx_hash if available
          status: "Success",
        };
        await createLog(logData, token);

        setStatusData((prevData) =>
          prevData.map((item) =>
            item.id === rowData.id
              ? { ...item, status: "rejected", rejectLoading: false } // Update status and stop loading
              : item
          )
        );
        setSnackbarMessage("Request has been rejected successfully.");
        setSnackbarType("success");
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Error in handleReject:", error);
      setSnackbarMessage("Failed to reject the request.");
      setSnackbarType("error");
    } finally {
      setOpenSnackbar(true);

      // Ensure loading state is reset in case of success or error
      setStatusData((prevData) =>
        prevData.map((item) => (item.id === rowData.id ? { ...item, rejectLoading: false } : item))
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
          // Create a log after successful approval
          const userEmail = localStorage.getItem("email");
          const logData = {
            req_id: rowData.id,
            admin_email: userEmail,
            user_email: rowData.email,
            action: "Approving",
            module: "Request",
            serial_number: rowData.serial_number || "N/A", // Use serial_number if available
            tx_hash: rowData.tx_hash || "N/A", // Use tx_hash if available
            status: "Success",
          };
          await createLog(logData, token);

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
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          {/* Tabs Section */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ width: "100%", maxWidth: "1000px" }} // Adjust maxWidth as needed
            >
              <Tab label="Pending Requests" />
              <Tab label="Approved Requests" />
              <Tab label="Rejected Requests" />
              <Tab label="Not Found Requests" />
            </Tabs>
          </Grid>

          {/* Table Section */}
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
                flexDirection="column"
              >
                <MDTypography variant="h6" color="dark">
                  Verification Requests
                </MDTypography>
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
                      rows: selectedRows,
                    }}
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
      rejectLoading: PropTypes.bool, // Boolean for loading state
      approveLoading: PropTypes.bool, // Boolean for loading state
    }).isRequired,
  }).isRequired,
  value: PropTypes.string.isRequired, // Ensure value is validated
};

export default Status;
