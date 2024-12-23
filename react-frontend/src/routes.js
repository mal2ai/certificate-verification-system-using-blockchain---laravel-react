import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
// import SignIn from "layouts/authentication/sign-in";
// import SignUp from "layouts/authentication/sign-up";
import Status from "layouts/status";
import Certificates from "layouts/admin/certificates";
import AdminStatus from "layouts/admin/status";
import ManageUser from "layouts/admin/manage-user/index";
import MyProfile from "layouts/profiles/index";
import Logs from "layouts/admin/logs/index";

// Import ProtectedRoute
import ProtectedRoute from "components/ProtectedRoute";

// @mui icons
import Icon from "@mui/material/Icon";

// Check authentication state
const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/admin/dashboard",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Certificates",
    key: "certificates",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/admin/certificates",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Certificates />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Request",
    key: "request",
    icon: <Icon fontSize="small">rate_review</Icon>,
    route: "/admin/request",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminStatus />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Manage User",
    key: "manage-user",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/admin/manage-user",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <ManageUser />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Logs",
    key: "logs",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/admin/logs",
    component: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Logs />
      </ProtectedRoute>
    ),
  },
  // {
  //   type: "collapse",
  //   name: "Tables",
  //   key: "tables",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   route: "/tables",
  //   component: (
  //     <ProtectedRoute allowedRoles={["admin"]}>
  //       <Tables />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   type: "collapse",
  //   name: "Billing",
  //   key: "billing",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/billing",
  //   component: (
  //     <ProtectedRoute allowedRoles={["admin"]}>
  //       <Billing />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   type: "collapse",
  //   name: "Notifications",
  //   key: "notifications",
  //   icon: <Icon fontSize="small">notifications</Icon>,
  //   route: "/notifications",
  //   component: (
  //     <ProtectedRoute allowedRoles={["admin"]}>
  //       <Notifications />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   type: "collapse",
  //   name: "Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: (
  //     <ProtectedRoute allowedRoles={["admin"]}>
  //       <Profile />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   type: "collapse",
  //   name: "Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/my-profile",
  //   component: (
  //     <ProtectedRoute allowedRoles={["admin", "user"]}>
  //       <MyProfile />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    type: "collapse",
    name: "Status",
    key: "status",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/status",
    component: (
      <ProtectedRoute allowedRoles={["user"]}>
        <Status />
      </ProtectedRoute>
    ),
  },
  // Public routes (Sign In/Sign Up)
  ...(isAuthenticated
    ? [] // Hide Sign In/Sign Up if logged in
    : []),
];

export default routes;
