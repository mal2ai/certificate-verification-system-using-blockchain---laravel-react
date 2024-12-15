import React, { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import { LibraryBooks } from "@mui/icons-material"; // Example icons

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

//image
import block from "assets/images/3d-cube.png";

//utils
import { getBlockchain } from "utils/blockchain";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [currentBlock, setCurrentBlock] = useState(null);
  const [certificateCount, setCertificateCount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch blockchain data when component mounts
  useEffect(() => {
    const fetchBlockchainData = async () => {
      const { currentBlock, contract, web3, accounts } = await getBlockchain();
      setCurrentBlock(currentBlock); // Update state with current block number

      // Fetch certificate count once blockchain data is available
      try {
        const count = await contract.methods.getCertificatesCount().call();

        // Convert BigInt to string or number
        const certificateCount = count.toString(); // Convert BigInt to string

        setCertificateCount(certificateCount); // Set state with certificate count
        setLoading(false);
      } catch (error) {
        console.error("Error fetching certificate count:", error);
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, []);

  // Convert BigInt to string or number for display
  const displayBlockNumber = currentBlock ? currentBlock.toString() : "Loading...";
  const certificateDisplayCount = certificateCount ? certificateCount : "Loading...";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              {loading ? (
                <ComplexStatisticsCard
                  color="dark"
                  icon={<LibraryBooks />}
                  title="Certificates"
                  count="Loading..."
                  percentage={{
                    color: "info",
                    amount: "0%",
                    label: "count",
                  }}
                />
              ) : (
                <ComplexStatisticsCard
                  color="dark"
                  icon={<LibraryBooks />}
                  title="Certificates"
                  count={certificateDisplayCount}
                  percentage={{
                    color: "success",
                    amount: "+55%", // You can replace this with dynamic data if needed
                    label: "than last week",
                  }}
                />
              )}
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Today's Users"
                count="2,300"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Revenue"
                count="34k"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={
                  <img
                    src={block}
                    alt="Block"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      filter: "invert(1)",
                    }}
                  />
                }
                title="Total Blocks"
                count={displayBlockNumber}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="website views"
                  description="Last Campaign Performance"
                  date="campaign sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="daily sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
