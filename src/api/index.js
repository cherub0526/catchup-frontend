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

// 用於追蹤是否正在刷新 token
let isRefreshing = false;
// 用於存儲待重試的請求
let failedQueue = [];

// 處理等待隊列中的請求
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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
  async (error) => {
    const originalRequest = error.config;

    // 如果錯誤不是 401 或者沒有 response，直接拋出錯誤
    if (!error.response || error.response.status !== 401) {
      if (error.response) {
        return Promise.reject(error.response);
      }
      return Promise.reject(error);
    }

    // 檢查是否有 token
    const token = localStorage.getItem("token");

    // 如果沒有 token，或者這個請求已經是重試的請求，或者是 refresh 請求本身，直接拋出錯誤
    if (!token || originalRequest._retry || originalRequest.url?.includes("/v1/auth/refresh")) {
      // 清除 token 並拋出錯誤
      localStorage.removeItem("token");
      if (error.response) {
        return Promise.reject(error.response);
      }
      return Promise.reject(error);
    }

    // 如果正在刷新 token，將請求加入隊列
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // 標記正在刷新
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 發送 refresh token 請求
      const response = await axios.post(
        `${apiUrl}/v1/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newToken = response.data.access_token || response.data.token;

      if (!newToken) {
        throw new Error("未收到新的 token");
      }

      // 更新 localStorage 中的 token
      localStorage.setItem("token", newToken);

      // 更新原始請求的 Authorization header
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      // 處理隊列中的其他請求
      processQueue(null, newToken);

      // 重試原始請求
      return client(originalRequest);
    } catch (refreshError) {
      // Token 刷新失敗，清除 token 並處理隊列
      processQueue(refreshError, null);
      localStorage.removeItem("token");

      if (refreshError.response) {
        return Promise.reject(refreshError.response);
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
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
      return client.put("/v1/users", data);
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
  media: {
    getMediaByType: (type, page = 1, range = "all") => {
      return client.get("/v1/media", { params: { type, page, range } });
    },
    getMediaById: (id) => {
      return client.get(`/v1/media/${id}`);
    },
    getCaptions: (mediaId) => {
      return client.get(`/v1/media/${mediaId}/captions`);
    },
    getCaptionById: (mediaId, captionId) => {
      return client.get(`/v1/media/${mediaId}/captions/${captionId}`);
    },
    getSummaries: (mediaId) => {
      return client.get(`/v1/media/${mediaId}/summaries`);
    },
    chat: (mediaId, messages) => {
      return client.post(`/v1/media/${mediaId}/chat`, { messages });
    },
  },
  subscription: {
    // 獲取當前用戶的訂閱方案
    getCurrentSubscription: () => {
      return client.get("/v1/subscriptions");
    },
    // 更新訂閱方案
    updateSubscription: (data) => {
      return client.post("/v1/subscriptions", data);
    },
    // 取消訂閱
    cancelSubscription: () => {
      return client.delete("/v1/subscriptions");
    },
    // 獲取使用情況
    getUsage: () => {
      return client.get("/v1/subscriptions/usage");
    },
    // 獲取所有可用方案
    getPlans: () => {
      return client.get("/v1/plans");
    },
    // 創建支付會話 (用於 Stripe 等支付集成)
    createCheckoutSession: (planId, billingCycle) => {
      return client.post("/v1/subscriptions/checkout", { planId, billingCycle });
    },
  },
};

export default api;
