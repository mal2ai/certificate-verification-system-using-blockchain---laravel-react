import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// User-related APIs
export const register = (data) => {
  return api.post("/register", data);
};

export const login = (data) => {
  return api.post("/login", data);
};

export const getUser = (token) => {
  return api.get("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const logout = (token) => {
  return api.post(
    "/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Profile-related APIs
export const getProfileDetails = (token) => {
  return api.get("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfileDetails = (data, token) => {
  return api.put("/profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changePassword = (data, token) => {
  return api.post("/profile/change-password", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Function to delete account
export const deleteAccount = (data, token) => {
  return api.post("/profile/delete-account", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Manage Users (Admin-only APIs)
export const getAllUsers = (token) => {
  return api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserById = (id, token) => {
  return api.get(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createUser = (data, token) => {
  return api.post("/users", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateUser = (id, data, token) => {
  return api.put(`/users/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteUser = (id, token) => {
  return api.delete(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New User-related API to count users (admin only)
export const countUsers = (token) => {
  return api.get("/users-count", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Status-related APIs
export const getStatusBySerialNumber = (serialNumber, token) => {
  return api.get(`/status/${serialNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateStatus = (serialNumber, statusData, token) => {
  return api.put(`/status/${serialNumber}`, statusData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const storeStatus = (data, token) => {
  return api.post(`/status`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New Status-related API to get status by email
export const getStatusByEmail = (email, token) => {
  return api.get(`/status/email/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New Status-related API to get all statuses
export const getAllStatuses = (token) => {
  return api.get(`/statuses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const countStatus = (token) => {
  return api.get("/status-count", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New User-related API to get user details by email (admin only)
export const getUserDetailsByEmail = (email, token) => {
  return api.get(`/user/details/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New Status-related API to delete a status by serial number (admin only)
export const deleteStatus = (serialNumber, token) => {
  return api.delete(`/status/${serialNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New Status-related API to update name, email, and serial_number
export const updateDetails = (serialNumber, email, statusData, token) => {
  return api.patch(`/status/update-details/${serialNumber}/${email}`, statusData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New OTP API to send OTP to the user
export const sendOTP = (email, token) => {
  return api.post(
    "/send-otp",
    { email }, // Pass the email in the request body
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// New OTP API to verify the OTP entered by the user
export const verifyOTP = (email, otp, token) => {
  return api.post(
    "/verify-otp",
    { email, otp }, // Pass email and OTP in the request body
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export default api;
