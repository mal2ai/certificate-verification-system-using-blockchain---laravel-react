import { useState, useEffect } from "react";

// react-router components
import { useLocation, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { Typography, Card, CardContent } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// Custom styled components for the dialog
const DialogContainer = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogPaper": {
    borderRadius: 12,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: "1.2rem",
  display: "flex",
  justifyContent: "center", // Center horizontally
  alignItems: "center", // Center vertically
  gap: "10px",
}));

const DialogActionsStyled = styled(DialogActions)(({ theme }) => ({
  justifyContent: "center",
  padding: theme.spacing(2),
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  borderRadius: 8,
  padding: theme.spacing(1, 4),
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.common.white, // Ensures text color stays white on hover
  },
  "&:focus": {
    color: theme.palette.common.white, // Ensures text color stays white on focus
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  borderRadius: 8,
  padding: theme.spacing(1, 4),
  "&:hover": {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.common.white, // Set text color to white on hover
  },
  "&:focus": {
    color: theme.palette.text.primary, // Ensures text color stays the same on focus
  },
}));

const CardSection = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleProfileClick = () => {
    navigate("/my-profile");
  };

  const handleOpenLogoutDialog = () => setOpenLogoutDialog(true);
  const handleCloseLogoutDialog = () => setOpenLogoutDialog(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    window.location.href = "/authentication/sign-in/basic"; // Redirect to login page
  };

  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      {/* Menu items go here */}
    </Menu>
  );

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox pr={1}>
              <MDInput label="Search here" />
            </MDBox>
            <MDBox color={light ? "white" : "inherit"}>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>

              <Tooltip title="My Profile" arrow>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleProfileClick}
                >
                  <Icon fontSize="small">person</Icon>
                </IconButton>
              </Tooltip>

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleOpenLogoutDialog}
              >
                <Tooltip title="Logout" arrow>
                  <Icon>logout</Icon>
                </Tooltip>
              </IconButton>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>

      {/* Enhanced Logout Confirmation Dialog */}
      <DialogContainer open={openLogoutDialog} onClose={handleCloseLogoutDialog}>
        {/* Top Section */}
        <DialogTitleStyled>
          <ExitToAppIcon fontSize="large" />
          Confirm Logout
        </DialogTitleStyled>

        {/* Middle Section inside the card */}
        <CardSection>
          <CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="body2" color="textSecondary" align="center">
              Are you sure you want to log out? You will need to log in again to access your
              account.
            </Typography>
          </CardContent>
        </CardSection>

        {/* Bottom Section with buttons */}
        <DialogActionsStyled>
          <CancelButton onClick={handleCloseLogoutDialog}>Cancel</CancelButton>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </DialogActionsStyled>
      </DialogContainer>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
