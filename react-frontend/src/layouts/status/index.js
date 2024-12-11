import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; // Import PropTypes

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

function Status() {
  const navigate = useNavigate();

  // State to hold the status data
  const [statusData, setStatusData] = useState([]);

  // State to manage loading state
  const [loading, setLoading] = useState(false);

  // Get the email from localStorage
  const email = localStorage.getItem("email");

  // Columns for the DataTable (you can adjust this based on your data)
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
            disabled={row.original.status === "approved"} // Disable the edit button if status is "approved"
          >
            Edit
          </MDButton>

          {/* View button */}
          <MDButton
            variant="outlined"
            color="success"
            onClick={() => handleView(row.original)}
            size="small"
            disabled={row.original.status === "pending" || row.original.status === "rejected"} // Disable the view button if status is "pending" or "rejected"
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
        setLoading(true); // Set loading to true before the request

        try {
          const response = await getStatusByEmail(email, localStorage.getItem("token"));
          console.log("API Response:", response); // Log the response

          if (response && response.data) {
            setStatusData(response.data);
          }
        } catch (error) {
          console.error("Error fetching status data:", error.response || error);
        } finally {
          setLoading(false); // Set loading to false after the request completes
        }
      };

      fetchStatus();
    }
  }, [email]);

  // Handle verify button click
  const handleVerify = () => {
    navigate("/verify"); // Navigate to verification page
  };

  // Handle Edit button click
  const handleEdit = (rowData) => {
    navigate(`/edit-status/${rowData.id}`, { state: { rowData } });
  };

  // Handle View button click
  const handleView = (rowData) => {
    navigate(`/view-status/${rowData.id}`, { state: { rowData } });
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
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Status
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={handleVerify} // Trigger certificate add and navigate
                >
                  New Verify
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? ( // Show loading spinner while data is being fetched
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                    <CircularProgress />
                  </div>
                ) : (
                  <DataTable
                    table={{ columns, rows: statusData }} // Pass the fetched status data as rows
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
    </DashboardLayout>
  );
}

// Define PropTypes for the component
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
