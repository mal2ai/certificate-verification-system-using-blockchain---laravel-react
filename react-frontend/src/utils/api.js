// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

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

export default api;
