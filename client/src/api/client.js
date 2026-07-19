import axios from "axios";

const DEFAULT_BASE_URL = "http://localhost:5001/api";
let BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_BASE_URL;

if (!BASE_URL || BASE_URL === "") {
  BASE_URL = DEFAULT_BASE_URL;
}

// Auto-fix if user forgot /api in their environment variables
if (!BASE_URL.endsWith('/api')) {
  if (BASE_URL.endsWith('/')) BASE_URL = BASE_URL.slice(0, -1);
  BASE_URL = `${BASE_URL}/api`;
}

console.log(`[API] baseURL = ${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000 // Increased from 10s to 60s to allow Render free tier to wake up
});

api.interceptors.request.use((config) => {
  const authRaw = localStorage.getItem("wishly_auth");
  if (authRaw) {
    const auth = JSON.parse(authRaw);
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequestUrl = error.config?.url || "";
      if (!originalRequestUrl.includes("/auth/login")) {
        localStorage.removeItem("wishly_auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const message =
    error?.response?.data?.message ||
    error?.response?.statusText ||
    error?.message;
  return message || fallback;
};

export default api;
