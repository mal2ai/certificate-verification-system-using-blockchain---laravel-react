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

// API function to get all logs
import { getLogs } from "utils/api";

// Material-UI loading spinner
import CircularProgress from "@mui/material/CircularProgress";

// Notification
import MDSnackbar from "components/MDSnackbar";

function Logs() {
  const navigate = useNavigate();
  const location = useLocation();

  // State to hold the log data
  const [logData, setLogData] = useState([]);

  // State to manage loading state
  const [loading, setLoading] = useState(false);

  // Notification state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("");

  const [selectedTab, setSelectedTab] = useState(0);

  // Define tab labels
  const tabLabels = ["Certificates", "Request", "Manage User", "User/Verify"];
  const tabModules = ["Certificates", "Request", "Manage User", "User"];

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  // Columns for the DataTable
  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Request ID", accessor: "req_id" },
    { Header: "User Email", accessor: "user_email" },
    { Header: "Admin Email", accessor: "admin_email" },
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
    { Header: "Action", accessor: "action" },
    { Header: "Module", accessor: "module" },
    {
      Header: "TX Hash",
      accessor: "tx_hash",
      Cell: ({ value }) => {
        const txHash = value;

        const truncatedTxHash = txHash
          ? `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 6)}`
          : "";

        return (
          <span title={txHash} style={{ cursor: "pointer", color: "#94849d" }}>
            {truncatedTxHash}
          </span>
        );
      },
    },
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
  ];

  // Fetch all log data when the component mounts
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);

      try {
        const response = await getLogs(localStorage.getItem("token"));

        if (response && response.data) {
          // Check if the response contains the "No logs found" message
          if (response.data.message === "No logs found") {
            setLogData([]); // Set the log data to an empty array
          } else {
            // Sort logs by ID in descending order
            const sortedLogs = response.data.sort((a, b) => b.id - a.id);
            setLogData(sortedLogs); // Set the sorted log data
          }
        } else {
          setLogData([]); // If there's no data in the response, set it to an empty array
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Handle the 404 status code without showing an error notification
          console.log("No logs found (404)");
          setLogData([]); // Set empty log data
        } else {
          // Only show an error notification for other errors
          setSnackbarMessage("Failed to fetch log data!");
          setSnackbarType("error");
          setOpenSnackbar(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {/* Tabs Section - Centered Tabs */}
            <Grid item xs={12} display="flex" justifyContent="center">
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ width: "100%", maxWidth: "1000px" }} // Adjust maxWidth if needed
              >
                {tabLabels.map((label, index) => (
                  <Tab key={index} label={label} />
                ))}
              </Tabs>
            </Grid>

            {/* Cards & Tables */}
            {tabModules.map(
              (module, index) =>
                selectedTab === index && (
                  <Card key={module} sx={{ marginTop: 5 }}>
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
                        Logs - {tabLabels[index]}
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
                            columns: columns.filter((column) => {
                              if (module === "Certificates")
                                return (
                                  column.accessor !== "user_email" && column.accessor !== "req_id"
                                );
                              if (module === "Request")
                                return column.accessor !== "tx_hash" && column.accessor !== "id";
                              if (module === "Manage User")
                                return (
                                  column.accessor !== "tx_hash" &&
                                  column.accessor !== "serial_number" &&
                                  column.accessor !== "req_id"
                                );
                              if (module === "User")
                                return (
                                  column.accessor !== "admin_email" &&
                                  column.accessor !== "id" &&
                                  column.accessor !== "tx_hash"
                                );
                              return true;
                            }),
                            rows: logData.filter((log) => log.module === module),
                          }}
                          isSorted={true}
                          defaultSortColumn="id"
                          defaultSortDirection="desc"
                          entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20, 25] }}
                          showTotalEntries={true}
                          canSearch={true}
                        />
                      )}
                    </MDBox>
                  </Card>
                )
            )}
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

Logs.propTypes = {
  value: PropTypes.string, // Add this if Logs directly uses 'value' prop
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      serial_number: PropTypes.string.isRequired,
      file_hash: PropTypes.string,
      status: PropTypes.string.isRequired,
    }),
  }),
};

export default Logs;
