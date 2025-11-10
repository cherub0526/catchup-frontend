// 複製原有的 API 客戶端
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const client = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
client.interceptors.request.use(
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

// Response interceptor
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      return Promise.reject(error.response);
    }
    return Promise.reject(error);
  }
);

// API endpoints
const api = {
  auth: {
    login: (account, password) => {
      return client.post("/v1/auth", { account, password });
    },
    register: (data) => {
      return client.post("/v1/register", data);
    },
    logout: () => {
      return client.post("/v1/logout");
    },
  },
  user: {
    getCurrentUser: () => {
      return client.get("/v1/users");
    },
    getProfile: () => {
      return client.get("/user/profile");
    },
    updateProfile: (data) => {
      return client.put("/user/profile", data);
    },
  },
  rss: {
    getSubscriptions: (type) => {
      return client.get("/v1/rss", { params: { type } });
    },
    addSubscription: (data) => {
      return client.post("/v1/rss", data);
    },
    deleteSubscription: (id) => {
      return client.delete(`/v1/rss/${id}`);
    },
  },
  videos: {
    getAll: () => {
      return client.get("/videos");
    },
    getById: (id) => {
      return client.get(`/videos/${id}`);
    },
    getBySource: (type) => {
      return client.get("/v1/videos", { params: { type } });
    },
  },
  media: {
    getMediaByType: (type, page = 1) => {
      return client.get("/v1/media", { params: { type, page } });
    },
    getMediaById: (id) => {
      return client.get(`/v1/media/${id}`);
    },
  },
};

export default api;
