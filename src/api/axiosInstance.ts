import axios from "axios";
import type { RootState } from "../app/store";

// Define the base URL for your backend API
const BASE_URL = "https://data-tracking-app-backend.onrender.com/api"; // Use 5001 or whatever port you settled on

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the Redux state
    const state = window.store.getState() as RootState;
    const token = state.auth.token;

    // Attach token if available
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

// IMPORTANT: Define `window.store` for the interceptor to access the state
declare global {
  interface Window {
    store: any;
  }
}
