import axios from "axios"
import toast from "react-hot-toast"
import { getLocalTasks, saveLocalTasks } from './storage';

// Create axios instance
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000")+"/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to being offline, try to get from localStorage if it's a GET request
    if (!navigator.onLine && error.config.method === 'get') {
      const url = new URL(error.config.url, window.location.origin);
      const pathParts = url.pathname.split('/');
      const date = pathParts[pathParts.length - 1];
      
      if (date) {
        const localData = getLocalTasks(date);
        if (localData) {
          return { data: { tasks: localData } };
        }
      }
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
      toast.error("Session expired. Please login again.")
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error("You don't have permission to perform this action.")
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error("Server error. Please try again later.")
    } 
    // Handle network error
    else if (!error.response) {
      toast.error("Network error. Please check your connection.")
    }
    
    // For other errors, reject the promise
    return Promise.reject(error);
  }
);

// Queue for failed requests to retry when back online
let requestQueue = [];

const processQueue = async () => {
  while (requestQueue.length > 0) {
    const { config, resolve, reject } = requestQueue.shift();
    try {
      const response = await api(config);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  }
};

// Listen for online event to retry failed requests
window.addEventListener('online', () => {
  processQueue();
});

export default api
