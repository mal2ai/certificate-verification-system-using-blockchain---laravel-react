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
import CircularProgress from "@mui/material/CircularProgress";
import MDTypography from "components/MDTypography";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

//image
import block from "assets/images/3d-cube.png";
import logo from "assets/images/logo.png";

//utils
import { getBlockchain } from "utils/blockchain";
import { countUsers, countStatus } from "utils/api"; // Import the countUsers function

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [currentBlock, setCurrentBlock] = useState("NULL");
  const [certificateCount, setCertificateCount] = useState("NULL");
  const [userCount, setUserCount] = useState(null); // State for user count
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [statusCount, setStatusCount] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Fetch blockchain data when component mounts
  useEffect(() => {
    const fetchBlockchainData = async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setLoading(true); // Show spinner only on the first load
      }

      try {
        const { currentBlock, contract } = await getBlockchain();
        setCurrentBlock(currentBlock); // Update state with current block number

        // Fetch certificate count once blockchain data is available
        const count = await contract.methods.getCertificatesCount().call();
        const certificateCount = count.toString(); // Convert BigInt to string

        setCertificateCount(certificateCount); // Set state with certificate count
      } catch (error) {
        console.error("Error fetching certificate count:", error);
      } finally {
        if (isInitialLoad) {
          setLoading(false); // Hide spinner only on first load
        }
      }
    };

    // Initial fetch with spinner
    fetchBlockchainData(true);

    // Set interval to fetch certificate count every 10 seconds without showing the spinner
    const intervalId = setInterval(() => fetchBlockchainData(false), 10000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Fetch user count from API
  useEffect(() => {
    const fetchUserCount = async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setLoadingUsers(true); // Show spinner only on the first load
      }

      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");

        // Call the countUsers API function with the token
        const response = await countUsers(token); // Passing token from localStorage

        setUserCount(response.data.count); // Assuming the response contains a 'count' property
      } catch (error) {
        console.error("Error fetching user count:", error);
      } finally {
        if (isInitialLoad) {
          setLoadingUsers(false); // Hide spinner only after the first load
        }
      }
    };

    // Initial fetch with spinner
    fetchUserCount(true);

    // Set interval to fetch user count every 10 seconds without showing the spinner
    const intervalId = setInterval(() => fetchUserCount(false), 10000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Fetch status count from API (for "pending" statuses)
  useEffect(() => {
    const fetchStatusCount = async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setLoadingStatus(true); // Show spinner only on the first load
      }

      try {
        const token = localStorage.getItem("token");
        const response = await countStatus(token); // Call API with token

        setStatusCount(response.data.count); // Update status count
      } catch (error) {
        console.error("Error fetching status count:", error);
      } finally {
        if (isInitialLoad) {
          setLoadingStatus(false); // Hide spinner only after the first load
        }
      }
    };

    // Initial fetch with spinner
    fetchStatusCount(true);

    // Set interval to update the status count every 10 seconds
    const intervalId = setInterval(() => fetchStatusCount(false), 10000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
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
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          {/* Left Section: Logo & Text */}
          <Grid item xs={12} md={6} lg={9}>
            <MDBox
              sx={{
                minHeight: "160px", // Height of the card
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "20px",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                boxShadow: 3,
              }}
            >
              <img
                src={logo}
                alt="Kolej Professional Baitumal Logo"
                style={{ width: "70px", height: "70px", marginRight: "20px" }}
              />
              <MDBox>
                <MDTypography variant="h5" fontWeight="bold">
                  Kolej Professional Baitumal Kuala Lumpur
                </MDTypography>
                <MDTypography variant="body2" mt={1}>
                  A cutting-edge certificate verification system powered by blockchain technology,
                  ensuring secure and tamper-proof authentication of academic and professional
                  credentials.
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>

          {/* Right Section: iFrame */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox
              sx={{
                overflow: "hidden",
                borderRadius: "10px",
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                alignItems: "center",
                padding: "5px",
                width: "100%",
                height: "160px", // Ensure it has enough height
                backgroundColor: "#ffffff",
                boxShadow: 3,
              }}
            >
              <iframe
                src="https://www.zeitverschiebung.net/clock-widget-iframe-v2?language=en&size=medium&timezone=Asia%2FKuala_Lumpur"
                width="100%"
                height="115"
                frameBorder="0"
                seamless
                style={{
                  pointerEvents: "none",
                  display: "block",
                  margin: "auto",
                  border: "none",
                  background: "transparent",
                }}
                title="Kuala Lumpur Time Widget"
              ></iframe>
            </MDBox>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              {loading ? (
                <ComplexStatisticsCard
                  color="dark"
                  icon="description"
                  title="Certificates"
                  count={<CircularProgress size={24} />} // Add CircularProgress here
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated",
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
                    amount: "",
                    label: "Just updated",
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
                  title="Total Users"
                  count={<CircularProgress size={24} />} // Display the spinner here
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated",
                  }}
                />
              ) : (
                <ComplexStatisticsCard
                  icon="group"
                  title="Total Users"
                  count={displayUserCount}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated",
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
                  count={<CircularProgress size={24} />} // Display the spinner here
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated",
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
                    amount: "",
                    label: "Just updated",
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
                count={loading ? <CircularProgress size={24} /> : displayBlockNumber} // Use loading state here
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        {/* <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="website views"
                  description="Last Performance"
                  date="updated sent 2 days ago"
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
        </MDBox> */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Projects />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
