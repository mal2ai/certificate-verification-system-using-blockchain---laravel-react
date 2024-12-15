import React, { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

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
import { countUsers, countStatus } from "utils/api"; // Import the countUsers function

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [currentBlock, setCurrentBlock] = useState(null);
  const [certificateCount, setCertificateCount] = useState(null);
  const [userCount, setUserCount] = useState(null); // State for user count
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [statusCount, setStatusCount] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Fetch blockchain data when component mounts
  useEffect(() => {
    const fetchBlockchainData = async () => {
      const { currentBlock, contract, web3, accounts } = await getBlockchain();
      setCurrentBlock(currentBlock); // Update state with current block number

      // Fetch certificate count once blockchain data is available
      try {
        const count = await contract.methods.getCertificatesCount().call();
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

  // Fetch user count from API
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");

        // Call the countUsers API function here with the token
        const response = await countUsers(token); // Passing token from localStorage

        setUserCount(response.data.count); // Assuming the response contains a 'count' property
        setLoadingUsers(false); // Update loading state
      } catch (error) {
        console.error("Error fetching user count:", error);
        setLoadingUsers(false);
      }
    };

    fetchUserCount();
  }, []);

  // Fetch status count from API (for "pending" statuses)
  useEffect(() => {
    const fetchStatusCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await countStatus(token); // Passing token from localStorage
        setStatusCount(response.data.count || 0); // Assuming the response contains a 'count' property
        setLoadingStatus(false); // Update loading state
      } catch (error) {
        console.error("Error fetching status count:", error);
        setLoadingStatus(false);
      }
    };

    fetchStatusCount();
  }, []);

  // Convert BigInt to string or number for display
  const displayBlockNumber = currentBlock ? currentBlock.toString() : "Loading...";
  const certificateDisplayCount = certificateCount ? certificateCount : "Loading...";
  const displayUserCount = userCount ? userCount : "Loading...";
  const displayStatusCount = statusCount || 0;

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
                  icon="description"
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
                  icon="description"
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
              {loadingUsers ? (
                <ComplexStatisticsCard
                  icon="group"
                  title="Today's Users"
                  count="Loading..."
                  percentage={{
                    color: "success",
                    amount: "+3%",
                    label: "than last month",
                  }}
                />
              ) : (
                <ComplexStatisticsCard
                  icon="group"
                  title="Total Users"
                  count={displayUserCount}
                  percentage={{
                    color: "success",
                    amount: "+3%", // You can replace this with dynamic data if needed
                    label: "than last month",
                  }}
                />
              )}
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              {loadingStatus ? (
                <ComplexStatisticsCard
                  color="warning"
                  icon="rate_review"
                  title="Pending Requests"
                  count="Loading..."
                  percentage={{
                    color: "success",
                    amount: "+1%",
                    label: "than yesterday",
                  }}
                />
              ) : (
                <ComplexStatisticsCard
                  color="warning"
                  icon="rate_review"
                  title="Pending Requests"
                  count={displayStatusCount}
                  percentage={{
                    color: "success",
                    amount: "+1%", // You can replace this with dynamic data if needed
                    label: "than yesterday",
                  }}
                />
              )}
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
