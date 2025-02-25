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

// API function to get all users
import { getAllUsers, deleteUser } from "utils/api";

// Material-UI loading spinner
import CircularProgress from "@mui/material/CircularProgress";

// Notification
import MDSnackbar from "components/MDSnackbar";

function ManageUser() {
  const navigate = useNavigate();
  const location = useLocation();

  // State to hold the user data for each role
  const [userData, setUserData] = useState([]);
  const [userRoleData, setUserRoleData] = useState([]);
  const [adminRoleData, setAdminRoleData] = useState([]);

  // State to manage loading state
  const [loading, setLoading] = useState(false);

  // Notification state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState(""); // "success" or "error"

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  // Columns for the DataTable with Edit and Delete buttons
  const columns = [
    { Header: "Account Type", accessor: "account_type" },
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Role", accessor: "role" },
    { Header: "Status", accessor: "status" },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <div>
          {/* Edit button */}
          <MDButton
            variant="outlined"
            color="info"
            onClick={() => handleEdit(row.original)}
            size="small"
            sx={{ marginLeft: "8px" }}
          >
            Edit
          </MDButton>
          {/* Delete button */}
          <MDButton
            variant="outlined"
            color="error"
            onClick={() => handleDelete(row.original)}
            size="small"
            sx={{ marginLeft: "8px" }}
          >
            Delete
          </MDButton>
          {/* Info button */}
          <MDButton
            variant="outlined"
            color="success"
            onClick={() => handleView(row.original)}
            size="small"
            sx={{ marginLeft: "8px" }}
          >
            View
          </MDButton>
        </div>
      ),
    },
  ];

  // Fetch all users when the component mounts
  useEffect(() => {
    let isInitialLoad = true; // Track if it's the first load

    const fetchUsers = async () => {
      try {
        if (isInitialLoad) setLoading(true); // Show spinner only on the first load

        const token = localStorage.getItem("token");
        const response = await getAllUsers(token);

        if (response && response.data) {
          setUserData(response.data);

          // Filter users by role
          const users = response.data.filter((user) => user.role === "user");
          const admins = response.data.filter((user) => user.role === "admin");
          setUserRoleData(users); // Users only
          setAdminRoleData(admins); // Admins only
        }
      } catch (error) {
        setSnackbarMessage("Failed to fetch users!");
        setSnackbarType("error");
        setOpenSnackbar(true);
      } finally {
        if (isInitialLoad) {
          setLoading(false); // Hide spinner after the first load
          isInitialLoad = false; // Prevent further spinner displays
        }
      }
    };

    // Fetch users initially
    fetchUsers();

    // Set up an interval to refresh every 10 seconds
    const interval = setInterval(() => {
      fetchUsers();
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

  const handleView = (rowData) => {
    navigate(`/admin/view-user/${rowData.id}`);
  };

  const handleEdit = (rowData) => {
    // Navigate to manage-user page with user ID
    navigate(`/admin/edit-user/${rowData.id}`);
  };

  const handleDelete = (rowData) => {
    // Navigate to the delete user page with the user ID
    navigate(`/admin/delete-user/${rowData.id}`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          {/* Tabs for Users and Admins */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ width: "100%", maxWidth: "800px" }} // Adjust maxWidth as needed
            >
              <Tab label="Users" />
              <Tab label="Admins" />
            </Tabs>
          </Grid>

          {/* Conditionally render tables based on the selected tab */}
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
                  {selectedTab === 0 ? "Manage Users" : "Manage Admins"}
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={() => navigate("/admin/add-user")}
                >
                  Add User
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
                      rows: selectedTab === 0 ? userRoleData : adminRoleData, // Toggle data
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

// PropTypes validation for 'row' and 'row.original'
ManageUser.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ManageUser;
