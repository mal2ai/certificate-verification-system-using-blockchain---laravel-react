import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardMedia,
  Button,
  Stack,
  AppBar,
  Toolbar,
  CardContent,
} from "@mui/material";
import MDButton from "components/MDButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import { getBlockchain } from "utils/blockchain";

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentBlock, setCurrentBlock] = useState("Loading...");
  const [contractAddress, setContractAddress] = useState("Loading...");
  const [networkName, setNetworkName] = useState("Loading...");
  const [networkStatus, setNetworkStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const { currentBlock, contract, networkName, networkStatus } = await getBlockchain();
        setCurrentBlock(currentBlock);
        setContractAddress(contract._address);
        setNetworkName(networkName);
        setNetworkStatus(networkStatus);
      } catch (error) {
        console.error("Error fetching blockchain data:", error);
        setNetworkStatus("Offline");
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately when component mounts
    fetchBlockchainData();

    // Set an interval to update the data every 10 seconds
    const intervalId = setInterval(fetchBlockchainData, 10000); // 10,000ms = 10s

    // Cleanup interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const displayBlockNumber = currentBlock ? currentBlock.toString() : "Loading...";

  return (
    <>
      {/* Navigation Bar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <img src="/logo.png" alt="Logo" style={{ width: 30 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: "bold" }}>
            Kolej Professional Baitumal Kuala Lumpur
          </Typography>
          <Stack direction="row" spacing={2}>
            <MDButton
              variant="outlined"
              color="dark"
              size="small"
              onClick={() => navigate("/sign-up")}
              sx={{ marginRight: 1 }}
            >
              Sign Up
            </MDButton>
            <Button variant="contained" color="white" onClick={() => navigate("/sign-in")}>
              Sign In
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
        {/* Logo & Title */}
        <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
          Certificate Verification System
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ mt: 1, color: "gray", fontStyle: "italic", fontSize: "1rem" }}
        >
          A secure way to verify certificates using blockchain technology.
        </Typography>

        {/* Blockchain Info Section */}
        <Typography variant="h6" sx={{ mt: 5, fontWeight: "bold" }}>
          Blockchain Information
        </Typography>
        <Card sx={{ mb: 3, backgroundColor: "#f5f5f5", borderRadius: 2, mt: 1 }}>
          <CardContent>
            <Grid container spacing={2} sx={{ mt: 1 }} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Network
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "0.85rem",
                    color: networkStatus === "Online" ? "black" : "gray",
                    fontStyle: networkStatus === "Offline" ? "italic" : "normal",
                  }}
                >
                  {loading ? "Loading..." : networkStatus === "Offline" ? "NULL" : networkName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Blocks
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "0.85rem",
                    color: networkStatus === "Online" ? "black" : "gray",
                    fontStyle: networkStatus === "Offline" ? "italic" : "normal",
                  }}
                >
                  {loading
                    ? "Fetching..."
                    : networkStatus === "Offline"
                    ? "NULL"
                    : displayBlockNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontSize: "0.85rem", color: networkStatus === "Online" ? "green" : "red" }}
                >
                  {loading ? "Loading..." : networkStatus}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Contract Address
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "0.85rem",
                    wordBreak: "break-word",
                    color: networkStatus === "Online" ? "blue" : "gray",
                    fontStyle: networkStatus === "Offline" ? "italic" : "normal",
                  }}
                >
                  {loading ? "Fetching..." : networkStatus === "Offline" ? "NULL" : contractAddress}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Blockchain Description */}
        <Card sx={{ mb: 3, backgroundColor: "#f5f5f5", borderRadius: 2, mt: 1 }}>
          <CardContent>
            <Grid container spacing={1} alignItems="center">
              {" "}
              {/* Reduced spacing */}
              {/* Text Section (Left) */}
              <Grid item xs={12} md={8} sx={{ pr: 2 }}>
                {" "}
                {/* Added padding-right to reduce gap */}
                <Typography variant="h6" color="textPrimary" sx={{ mb: 1, textAlign: "center" }}>
                  What is Blockchain?
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: "0.95rem", textAlign: "justify" }}
                >
                  Blockchain is a decentralized, distributed ledger technology that records
                  transactions across multiple computers securely. Each block contains a
                  cryptographic hash of the previous block, making it tamper-resistant and ensuring
                  data integrity.
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: "0.95rem", textAlign: "justify", mt: 1 }}
                >
                  It is widely used in cryptocurrencies, supply chain management, digital identity,
                  and more. Blockchain enhances security, transparency, and decentralization,
                  eliminating the need for intermediaries in transactions.
                </Typography>
              </Grid>
              {/* Image Section (Right) */}
              <Grid
                item
                xs={12}
                md={4}
                sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                <img
                  src="https://png.pngtree.com/png-clipart/20230128/original/pngtree-blockchain-vector-transparent-image-png-image_8933372.png"
                  alt="Blockchain Illustration"
                  style={{
                    width: "100%",
                    maxWidth: "180px", // Reduced width slightly to align better
                    height: "auto",
                    borderRadius: "10px",
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Typography variant="h6" sx={{ mt: 5, fontWeight: "bold" }}>
          Frequently Asked Questions
        </Typography>
        <Accordion sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">How does this system work?</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ textAlign: "left" }}>
            <Typography variant="body2" sx={{ color: "gray" }}>
              This system verifies certificates using blockchain technology, ensuring authenticity
              and security.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Is my certificate data secure?</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ textAlign: "left" }}>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Yes, all certificate data is stored securely using IPFS and verified on Ethereum
              blockchain.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              What happens if I lose my digital certificate PDF file?
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ textAlign: "left" }}>
            <Typography variant="body2" sx={{ color: "gray" }}>
              If you lose your certificate, you can verify its authenticity on the blockchain using
              the certificate&apos;s unique serial number. Since the data is stored securely, your
              certificate remains verifiable at any time.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Screenshot Section */}
        <Typography variant="h6" sx={{ mt: 5, fontWeight: "bold", mb: 3 }}>
          How to Use the System
        </Typography>
        {/* Step 1 */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 200, width: "100%", height: "auto", mx: "auto" }}
                image="/register.png"
                alt="Step 1"
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 1: Sign Up / Register Your Account
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Fill in the form details to register your account. Then click the{" "}
              <span style={{ color: "#808080", fontWeight: "bold" }}>SIGN UP</span> button.
            </Typography>
          </Grid>
        </Grid>

        {/* Step 2 (Reversed Order) */}
        <Grid container spacing={4} alignItems="center" sx={{ mt: 4, mb: 5 }}>
          <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 2: Activate Your Account
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Click the button{" "}
              <span style={{ color: "#808080", fontWeight: "bold" }}>Activate My Account</span> in
              your mail that you used to register your account to verify your email address. Then
              Sign In to your account.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 300, width: "100%", height: "auto", mx: "auto" }}
                image="/activate.png"
                alt="Step 2"
              />
            </Card>
          </Grid>
        </Grid>

        {/* Step 3 */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 500, width: "100%", height: "auto", mx: "auto" }}
                image="/status.png"
                alt="Step 1"
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 3: New Verification Request
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Click the <span style={{ color: "#808080", fontWeight: "bold" }}>NEW VERIFY</span>{" "}
              button to add new request of certificate verification.
            </Typography>
          </Grid>
        </Grid>

        {/* Step 4 (Reversed Order) */}
        <Grid container spacing={4} alignItems="center" sx={{ mt: 4, mb: 5 }}>
          <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 4: Choose Types of Verification
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              You can choose either verify by using serial number or verify by uploading the
              certificate PDF file (original copy). Then click the{" "}
              <span style={{ color: "#808080", fontWeight: "bold" }}>SENT REQUEST</span> button.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 600, width: "100%", height: "auto", mx: "auto" }}
                image="/add-verify.png"
                alt="Step 2"
              />
            </Card>
          </Grid>
        </Grid>

        {/* Step 5 */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 700, width: "100%", height: "auto", mx: "auto" }}
                image="/request.png"
                alt="Step 1"
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 5: Waiting for Verification to be Approved
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Administator of KPBKL will review first and approve your verification request.
            </Typography>
          </Grid>
        </Grid>

        {/* Step 6 (Reversed Order) */}
        <Grid container spacing={4} alignItems="center" sx={{ mt: 4, mb: 5 }}>
          <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 6: OTP Code by Email
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              You will receive an OTP code by email upon your request have been approved to verify
              your certificate request.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 300, width: "100%", height: "auto", mx: "auto" }}
                image="/otp-email.png"
                alt="Step 2"
              />
            </Card>
          </Grid>
        </Grid>

        {/* Step 7 */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 500, width: "100%", height: "auto", mx: "auto" }}
                image="/otp-code.png"
                alt="Step 1"
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 7: Insert OTP Code
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Click the <span style={{ color: "#808080", fontWeight: "bold" }}>VIEW</span> button at
              the request you have been made to insert the OTP code that you received by email. Then
              click the <span style={{ color: "#808080", fontWeight: "bold" }}>VERIFY</span> button.
            </Typography>
          </Grid>
        </Grid>

        {/* Step 8 (Reversed Order) */}
        <Grid container spacing={4} alignItems="center" sx={{ mt: 4, mb: 5 }}>
          <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Step 8: Certificate Verified
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Your certificate has been verified successfully. You can view the certificate details
              and download the certificate. You can download the PDF file by clicking the{" "}
              <DownloadIcon sx={{ fontSize: "1.2rem", color: "#1976D2" }} /> button.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
            <Card>
              <CardMedia
                component="img"
                sx={{ maxWidth: 600, width: "100%", height: "auto", mx: "auto" }}
                image="/certificate-display.png"
                alt="Step 2"
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default LandingPage;
