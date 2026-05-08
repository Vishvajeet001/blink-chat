import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://blink-chat-server.onrender.com",
});

// Add request interceptor to dynamically set Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;