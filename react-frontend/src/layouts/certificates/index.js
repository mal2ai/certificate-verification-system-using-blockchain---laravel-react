import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

//ui
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// utils
import { getBlockchain } from "utils/blockchain";

// data
import DataTable from "examples/Tables/DataTable";

// Define the CID Cell Component
const CIDCell = ({ value }) => (
  <a href={`http://127.0.0.1:8080/ipfs/${value}`} target="_blank" rel="noopener noreferrer">
    {value}
  </a>
);

// Add PropTypes validation for the CIDCell component
CIDCell.propTypes = {
  value: PropTypes.string.isRequired,
};

const ActionsCell = ({ row }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    const serialNumber = row.original.serialNumber; // Use the serialNumber instead of ID
    if (serialNumber) {
      navigate(`/edit-certificate/${serialNumber}`); // Navigate to the edit page with the serial number
    } else {
      console.error("Certificate serial number not found.");
    }
  };

  const handleDelete = () => {
    const serialNumber = row.original.serialNumber;
    if (serialNumber) {
      navigate(`/delete-certificate/${serialNumber}`); // Redirect to DeleteCertificate page
    } else {
      console.error("Certificate serial number not found.");
    }
  };

  return (
    <div>
      <MDButton
        variant="gradient"
        color="info"
        onClick={handleEdit}
        sx={{ marginRight: 1 }} // Add right margin for the gap between buttons
      >
        Edit
      </MDButton>
      <MDButton variant="gradient" color="error" onClick={handleDelete}>
        Delete
      </MDButton>
    </div>
  );
};

// Add PropTypes validation for the ActionsCell component
ActionsCell.propTypes = {
  row: PropTypes.object.isRequired, // row should be an object
};

function Certificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { contract } = await getBlockchain();
        const data = await contract.methods.getAllCertificates().call();

        // Map contract data into rows format
        const rows = data[0].map((_, index) => ({
          serialNumber: data[0][index],
          name: data[1][index],
          cid: data[2][index],
          id: index,
        }));

        setCertificates(rows);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Define columns for the table
  const columns = [
    { Header: "Serial Number", accessor: "serialNumber", align: "left" },
    { Header: "Name", accessor: "name", align: "left" },
    { Header: "CID", accessor: "cid", align: "left", Cell: CIDCell },
    {
      Header: "Actions",
      accessor: "id", // This should reference the row id to link actions
      Cell: ActionsCell, // Use the ActionsCell component
      align: "center",
    },
  ];

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
                  Certificates
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={() => navigate("/certificates/add")}
                >
                  Add Certificate
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {isLoading ? (
                  <MDTypography variant="h6" align="center">
                    Loading...
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns, rows: certificates }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
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

export default Certificates;
