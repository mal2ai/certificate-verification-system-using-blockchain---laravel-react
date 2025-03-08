import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";

// ProtectedRoute component
import ProtectedRoute from "components/ProtectedRoute";
import RedirectToDashboard from "components/RedirectToDashboard";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo.png";
import brandDark from "assets/images/logo.png";

//routers
import Certificates from "layouts/admin/certificates/index";
import AddCertificates from "layouts/admin/certificates/addcertificates";
import EditCertificates from "layouts/admin/certificates/editcertificates";
import DeleteCertificate from "layouts/admin/certificates/deleteCertificates";
import AddVerify from "layouts/status/addVerify";
// import Verify from "layouts/status/verify";
import ViewCertificate from "layouts/status/view-certificate";
import VerifyOTP from "layouts/status/verify-otp";
import AdminViewCertificate from "layouts/admin/certificates/view-certificate";
import ViewRequest from "layouts/admin/status/view-status";
import ManageUser from "layouts/admin/manage-user/index";
import EditUser from "layouts/admin/manage-user/edit-user";
import AddUser from "layouts/admin/manage-user/add-user";
import ViewUser from "layouts/admin/manage-user/view-user";
import DeleteUser from "layouts/admin/manage-user/delete-user";
import EditVerify from "layouts/status/editVerify";
import Profile from "layouts/profiles/index";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Status from "layouts/status";
import VerifyMFA from "layouts/authentication/Verify-MFA";

//reminder import
import DataPolicyReminder from "components/Reminder/reminder";
import TermsAndConditions from "components/TermsAndConditions/index";

//landing page
import Landing from "layouts/landing/index";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Retrieve user role
  const userRole = localStorage.getItem("role");

  // Filter routes based on user role
  const filteredRoutes = routes.filter((route) => {
    // If the route has no allowedRoles, show it by default
    if (!route.component.props.allowedRoles) return true;

    // Check if the user's role is allowed for the route
    return route.component.props.allowedRoles.includes(userRole);
  });

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  const isAuthenticated = !!localStorage.getItem("role") && !!localStorage.getItem("token");

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        <DataPolicyReminder />

        {layout === "dashboard" && isAuthenticated && pathname !== "/" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName={
                <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
                  &nbsp;CERTIFY
                </Link>
              }
              routes={filteredRoutes} // Pass filtered routes here
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {/* {configsButton} */}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(filteredRoutes)} {/* Use filtered routes */}
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <DataPolicyReminder />
      {layout === "dashboard" && isAuthenticated && pathname !== "/" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName={
              <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
                &nbsp;CERTIFY
              </Link>
            }
            routes={filteredRoutes} // Pass filtered routes here
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {/* {configsButton} */}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(filteredRoutes)} {/* Use filtered routes */}
        <Route path="*" element={<Navigate to="/sign-in" />} />
        <Route path="/" element={<Landing />} />
        <Route path="/termsandconditons" element={<TermsAndConditions />} />
        <Route
          path="/sign-in"
          element={
            <>
              <RedirectToDashboard />
              <SignIn />
            </>
          }
        />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/verify-mfa" element={<VerifyMFA />} />
        {/* Protected Routes */}
        <Route
          path="/admin/certificates/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddCertificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-certificate/:serialNumber"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditCertificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/delete-certificate/:serialNumber"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeleteCertificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/view-certificate/:serialNumber"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminViewCertificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/view-request"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-user"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-user/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/delete-user/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeleteUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-user"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/view-user/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Status />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-verify"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <AddVerify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-verify"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <EditVerify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-certificate"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ViewCertificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <VerifyOTP />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Non-Protected Routes */}
        {/* <Route path="/verify" element={<Verify />} /> */}
      </Routes>
    </ThemeProvider>
  );
}

// PropTypes validation
App.propTypes = {
  children: PropTypes.node, // Validate that children is a valid React node (this is if you're passing children to App component)
};
