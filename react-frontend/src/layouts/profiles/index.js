import React, { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ProfileForm({ userData, onSave }) {
  const [formData, setFormData] = useState(userData);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (event, formType) => {
    event.preventDefault();
    onSave({ formType, formData });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Card>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {/* Profile Information Section */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      {/* Left Section: Title and Description */}
                      <Grid item xs={12} md={4}>
                        <MDBox>
                          <MDTypography variant="h5" fontWeight="medium">
                            Profile Information
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mt={1} mb={2}>
                            Update your account&#39;s profile information and email address.
                          </MDTypography>
                        </MDBox>
                      </Grid>

                      {/* Right Section: Form Fields */}
                      <Grid item xs={12} md={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            <form onSubmit={(e) => handleSubmit(e, "profile")}>
                              <MDBox mb={3}>
                                <MDInput
                                  type="text"
                                  label="Full Name"
                                  name="name"
                                  value=""
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </MDBox>
                              <MDBox mb={3}>
                                <MDInput
                                  type="email"
                                  label="Email"
                                  name="email"
                                  value=""
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </MDBox>
                              <MDBox display="flex" justifyContent="flex-end">
                                <MDButton variant="gradient" color="success" type="submit">
                                  Save
                                </MDButton>
                              </MDBox>
                            </form>
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                  </Grid>

                  {/* Update Password Section */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      {/* Left Section: Title and Description */}
                      <Grid item xs={12} md={4}>
                        <MDBox>
                          <MDTypography variant="h5" fontWeight="medium">
                            Update Password
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mt={1}>
                            Ensure your account is using a long, random password to stay secure.
                          </MDTypography>
                        </MDBox>
                      </Grid>

                      {/* Right Section: Form Fields */}
                      <Grid item xs={12} md={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            <form onSubmit={(e) => handleSubmit(e, "password")}>
                              <MDBox mb={3}>
                                <MDInput
                                  type="password"
                                  label="Current Password"
                                  name="currentPassword"
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </MDBox>
                              <MDBox mb={3}>
                                <MDInput
                                  type="password"
                                  label="New Password"
                                  name="newPassword"
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </MDBox>
                              <MDBox mb={3}>
                                <MDInput
                                  type="password"
                                  label="Confirm Password"
                                  name="confirmPassword"
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </MDBox>
                              <MDBox display="flex" justifyContent="flex-end">
                                <MDButton variant="gradient" color="success" type="submit">
                                  Save
                                </MDButton>
                              </MDBox>
                            </form>
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

ProfileForm.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ProfileForm;
