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
    const fetchUsers = async () => {
      setLoading(true);

      try {
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
        setLoading(false);
      }
    };

    fetchUsers();
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
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Table for user role */}
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
                  Manage Users
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
                    table={{ columns, rows: userRoleData }}
                    isSorted={true}
                    entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20, 25] }}
                    showTotalEntries={true}
                    canSearch={true}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Table for admin role */}
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
                  Manage Admins
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
                    table={{ columns, rows: adminRoleData }}
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
