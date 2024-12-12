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

// API function to get status by email
import { getStatusByEmail } from "utils/api";

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

  // Get the email from localStorage
  const email = localStorage.getItem("email");

  // Columns for the DataTable
  const columns = [
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Serial Number", accessor: "serial_number" },
    { Header: "Status", accessor: "status" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <div>
          {/* Edit button */}
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

          {/* View button */}
          <MDButton
            variant="outlined"
            color="success"
            onClick={() => handleView(row.original)}
            size="small"
            disabled={row.original.status === "pending" || row.original.status === "rejected"}
          >
            View
          </MDButton>
        </div>
      ),
    },
  ];

  // Fetch status data when the component mounts
  useEffect(() => {
    if (email) {
      const fetchStatus = async () => {
        setLoading(true);

        try {
          const response = await getStatusByEmail(email, localStorage.getItem("token"));
          if (response && response.data) {
            setStatusData(response.data);
          }
        } catch (error) {
          setSnackbarMessage("Failed to fetch status data!");
          setSnackbarType("error");
          setOpenSnackbar(true);
        } finally {
          setLoading(false);
        }
      };

      fetchStatus();
    }
  }, [email]);

  // Handle success message if present in the location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarType("success");
      setOpenSnackbar(true);

      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Handle verify button click
  const handleVerify = () => {
    navigate("/add-verify");
  };

  // Handle Edit button click
  const handleEdit = (rowData) => {
    navigate(`/edit-status/${rowData.id}`, { state: { rowData } });
  };

  // Handle View button click
  const handleView = (rowData) => {
    // Check if the status is "approved"
    if (rowData.status === "approved") {
      // If approved, navigate to the view certificate page
      navigate(`/view-certificate`, {
        state: {
          name: rowData.name,
          email: rowData.email,
          serial_number: rowData.serial_number,
          status: rowData.status,
        },
      });
    } else {
      // If status is not "approved", show an error message in the snackbar
      setSnackbarMessage(
        <>
          Your request has not been approved yet <br /> or has been rejected.
        </>
      );
      setSnackbarType("error");
      setOpenSnackbar(true);
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
                  Status
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
                    entriesPerPage={true}
                    showTotalEntries={true}
                    noEndBorder
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
    }),
  }),
};

export default Status;
