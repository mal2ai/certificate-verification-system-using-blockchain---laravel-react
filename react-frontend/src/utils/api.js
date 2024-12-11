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

export default api;
