import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";

const TermsAndConditionsModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        },
      }}
    >
      {/* Header with Print & Close Buttons */}
      <DialogTitle
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h6" fontWeight="bold">
          Terms and Conditions
        </Typography>
        <div>
          <IconButton>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      {/* Scrollable Modal Content */}
      <DialogContent dividers style={{ maxHeight: "400px", overflow: "auto" }}>
        <Typography variant="body2" gutterBottom>
          Welcome to our platform. By using this service, you agree to the following terms and
          conditions. Please read carefully.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          1. General Site Usage
        </Typography>
        <Typography variant="body2">
          This site is provided as a service to our visitors and may be used for informational
          purposes only. Because the Terms and Conditions contain legal obligations, please read
          them carefully.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          2. Your Agreement
        </Typography>
        <Typography variant="body2">
          By using this site, you agree to be bound by, and to comply with, these Terms and
          Conditions. If you do not agree to these Terms and Conditions, do not use this site.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          3. Changes to Terms
        </Typography>
        <Typography variant="body2">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any
          time. It is your responsibility to review these Terms periodically for changes. Continued
          use of the service after changes constitutes acceptance of those changes.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          4. User Responsibilities
        </Typography>
        <Typography variant="body2">
          You agree to use this site only for lawful purposes. You must not misuse the platform or
          engage in fraudulent, illegal, or unauthorized activities.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          5. Limitation of Liability
        </Typography>
        <Typography variant="body2">
          We are not responsible for any direct, indirect, incidental, special, or consequential
          damages resulting from the use of our service.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          6. Data Privacy and Confidentiality
        </Typography>
        <Typography variant="body2">
          We are committed to protecting your personal data and privacy. Any personal information
          you provide will be processed in accordance with our Privacy Policy. We do not sell, rent,
          or share your data with third parties without your consent, except as required by law.
        </Typography>
        <Typography variant="body2">
          You agree not to disclose, share, or distribute any confidential information obtained
          through this platform. Unauthorized use or distribution of confidential data may result in
          legal action.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          7. Data Conversion and Integrity
        </Typography>
        <Typography variant="body2">
          The platform may process or convert data to different formats for compatibility or
          operational purposes. We do not guarantee that data conversions will always be error-free
          or that formatting will remain unchanged. Users are responsible for verifying the accuracy
          and completeness of any converted data.
        </Typography>

        <Typography variant="h6" fontWeight="bold" mt={2}>
          8. Contact Information
        </Typography>
        <Typography variant="body2">
          For inquiries, please contact the system administrator at{" "}
          <span style={{ color: "#42a5f5", fontWeight: "bold" }}>support@kpbkl.edu.my</span>.
        </Typography>
      </DialogContent>

      {/* Footer with Accept and Decline Buttons */}
      <DialogActions>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#1976D2", // Blue background
            color: "#ffffff",
            borderRadius: 2,
            width: "auto", // Set width to half
            display: "block", // Ensures centering works
            "&:hover": { bgcolor: "#1565C0" }, // Darker blue on hover
          }}
          onClick={onClose} // Keep onClose function
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ✅ PropTypes Validation */
TermsAndConditionsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TermsAndConditionsModal;
