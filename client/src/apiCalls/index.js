import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://quick-chat-webapp.onrender.com",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);