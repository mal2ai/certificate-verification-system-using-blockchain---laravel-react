import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// UI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Utils
import { getBlockchain } from "utils/blockchain";

// Data
import DataTable from "examples/Tables/DataTable";

// Notification
import MDSnackbar from "components/MDSnackbar";

// Material-UI loading spinner
import CircularProgress from "@mui/material/CircularProgress";

// Define the CID Cell Component
// const CIDCell = ({ value }) => (
//   <a href={`http://127.0.0.1:8080/ipfs/${value}`} target="_blank" rel="noopener noreferrer">
//     {value}
//   </a>
// );

// CIDCell.propTypes = {
//   value: PropTypes.string.isRequired,
// };

const ActionsCell = ({ row }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    const serialNumber = row.original.serialNumber;
    if (serialNumber) {
      navigate(`/admin/edit-certificate/${serialNumber}`);
    } else {
      console.error("Certificate serial number not found.");
    }
  };

  const handleDelete = () => {
    const serialNumber = row.original.serialNumber;
    if (serialNumber) {
      navigate(`/admin/delete-certificate/${serialNumber}`);
    } else {
      console.error("Certificate serial number not found.");
    }
  };

  const handleView = () => {
    const serialNumber = row.original.serialNumber;
    if (serialNumber) {
      navigate(`/admin/view-certificate/${serialNumber}`);
    } else {
      console.error("Certificate serial number not found.");
    }
  };

  return (
    <div>
      <MDButton
        variant="outlined"
        color="info"
        size="small"
        onClick={handleEdit}
        sx={{ marginRight: 1 }}
      >
        Edit
      </MDButton>
      <MDButton
        variant="outlined"
        color="error"
        size="small"
        onClick={handleDelete}
        sx={{ marginRight: 1 }}
      >
        Delete
      </MDButton>
      <MDButton
        variant="outlined"
        color="success"
        size="small"
        onClick={handleView}
        sx={{ marginRight: 1 }}
      >
        View
      </MDButton>
    </div>
  );
};

ActionsCell.propTypes = {
  row: PropTypes.object.isRequired,
};

function Certificates() {
  const navigate = useNavigate();
  const location = useLocation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Notification state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState(""); // "success" or "error"

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  // Track if the certificate is added successfully
  const [certificateAdded, setCertificateAdded] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const { adminAccount, contract } = await getBlockchain(); // Get adminAccount along with the contract
        const data = await contract.methods.getAllCertificates().call({ from: adminAccount }); // Use adminAccount here

        const rows = data[0].map((_, index) => ({
          serialNumber: data[0][index],
          name: data[1][index],
          cid: data[2][index],
          icNumber: data[3][index],
          courseName: data[5][index],

          id: index,
        }));

        setCertificates(rows);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [certificateAdded]); // Refresh certificates when certificate is added

  // Handle success message if present in the location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarType("success");
      setOpenSnackbar(true);

      // Clear the success message from location state to prevent it from showing again
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const columns = [
    { Header: "Serial Number", accessor: "serialNumber", align: "left" },
    { Header: "Name", accessor: "name", align: "left" },
    { Header: "IC Number", accessor: "icNumber", align: "left" },
    { Header: "Course", accessor: "courseName", align: "left" },
    {
      Header: "Actions",
      accessor: "id",
      Cell: ActionsCell,
      align: "center",
    },
  ];

  const handleAddCertificate = async () => {
    try {
      // Simulate the certificate addition logic
      setCertificateAdded(true); // Set state to refresh the table with the new certificate
      navigate("/admin/certificates/add"); // Navigate first
    } catch (error) {
      setSnackbarMessage("Failed to add certificate!");
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
                  Certificates
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={handleAddCertificate} // Trigger certificate add and navigate
                >
                  Add Certificate
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? ( // Show loading spinner while data is being fetched
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                    <CircularProgress />
                  </div>
                ) : (
                  <DataTable
                    table={{ columns, rows: certificates }}
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

      {/* MDSnackbar to show the notifications */}
      <MDSnackbar
        color={snackbarType}
        icon={snackbarType === "success" ? "check_circle" : "error"} // Choose icon based on type
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

export default Certificates;
