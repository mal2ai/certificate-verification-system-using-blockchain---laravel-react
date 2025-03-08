import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  DialogTitle,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TermsAndConditions from "components/TermsAndConditions";

const DataPolicyReminder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/admin/dashboard") {
      const hasSeenReminder = sessionStorage.getItem("hasSeenReminder");
      if (!hasSeenReminder) {
        setIsOpen(true);
        sessionStorage.setItem("hasSeenReminder", "true");
      }
    }
  }, [location.pathname]);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#FFFFFF",
            color: "#333",
            borderRadius: 3,
            padding: "50px 20px 20px",
            maxWidth: "380px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            position: "relative",
            overflow: "visible",
          },
        }}
      >
        {/* Icon above the modal */}
        <Box
          sx={{
            position: "absolute",
            top: "-35px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#FFD700",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
            zIndex: 10,
          }}
        >
          <NotificationsActiveIcon sx={{ fontSize: "36px", color: "#fff" }} />
        </Box>

        <DialogContent sx={{ textAlign: "center", pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: "0.9rem", color: "#777" }}>
            Data Policy Reminder
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "1rem",
              marginTop: 1,
              color: "#292929",
              backgroundColor: "#f2f2f2",
              padding: "8px",
              borderRadius: "5px",
              display: "inline-block",
            }}
          >
            The data displayed on this screen is <strong>confidential</strong>. Sharing, copying, or
            distributing this information is strictly <strong>prohibited</strong>.
          </Typography>

          {/* Link to open Terms & Conditions modal */}
          <Button
            variant="text"
            startIcon={<InfoIcon />}
            sx={{
              color: "#007BFF",
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "none",
              mt: 1, // Reduce margin
              "&:hover": {
                color: "#0056b3",
                textDecoration: "underline",
              },
            }}
            onClick={() => {
              setIsOpen(false);
              setTimeout(() => setIsTermsOpen(true), 300);
            }}
          >
            View Terms & Conditions
          </Button>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#1976D2",
              color: "#ffffff",
              borderRadius: 2,
              width: "50%",
              mx: "auto",
              "&:hover": { bgcolor: "#1565C0" },
            }}
            onClick={() => setIsOpen(false)}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terms & Conditions Modal */}
      {isTermsOpen && (
        <TermsAndConditions open={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      )}
    </>
  );
};

export default DataPolicyReminder;
