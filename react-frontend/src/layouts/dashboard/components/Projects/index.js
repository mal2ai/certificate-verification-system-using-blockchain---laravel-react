import { useState, useEffect } from "react";
import { getTransactions } from "utils/api"; // Assuming your getTransactions function is in utils/api

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

function Projects() {
  const [transactions, setTransactions] = useState([]);
  const [menu, setMenu] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Fetch transactions when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await getTransactions(token);
        setTransactions(response.data.transactions);
        setLoadingTransactions(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []); // Empty dependency array means this effect runs once after the component mounts

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={closeMenu}>Action</MenuItem>
      <MenuItem onClick={closeMenu}>Another action</MenuItem>
      <MenuItem onClick={closeMenu}>Something else</MenuItem>
    </Menu>
  );

  // Define columns based on the transaction data structure
  const columns = [
    { Header: "Transaction Hash", accessor: "transaction_hash" },
    { Header: "Block Number", accessor: "block_number" },
    { Header: "Gas Used", accessor: "gas_used" },
    { Header: "Status", accessor: "status" },
    { Header: "Created At", accessor: "created_at" },
  ];

  // Map the transactions and format the date
  const rows = transactions
    .map((transaction) => {
      const createdAt = new Date(transaction.created_at); // Parse created_at into Date object

      // Format the date to dd/mm/yyyy, h:m am/pm
      const formattedDate = createdAt.toLocaleString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        transaction_hash: transaction.transaction_hash,
        block_number: transaction.block_number,
        gas_used: transaction.gas_used,
        status: transaction.status,
        created_at: formattedDate,
      };
    })
    .sort((a, b) => b.block_number - a.block_number);

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Transactions
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              done
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{transactions.length} transactions</strong> this month
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>

      <MDBox>
        {loadingTransactions ? ( // Show loading spinner while fetching data
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              padding: "20px",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <DataTable
            table={{ columns, rows }} // Pass the sorted rows
            showTotalEntries={true}
            isSorted={true}
            noEndBorder
            entriesPerPage={true}
          />
        )}
      </MDBox>
    </Card>
  );
}

export default Projects;
