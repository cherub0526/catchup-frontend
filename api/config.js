/**
 * API 配置模組
 * 從環境變數讀取配置
 */

// 在開發環境中載入 .env 檔案
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch (error) {
    console.warn("未安裝 dotenv，請執行: npm install dotenv");
  }
}

const config = {
  // API 基礎配置
  api: {
    baseUrl: process.env.API_BASE_URL || "https://local.cherub0526.qzz.io",
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // OAuth 配置
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost/callback",
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID || "",
      appSecret: process.env.FACEBOOK_APP_SECRET || "",
      redirectUri: process.env.FACEBOOK_REDIRECT_URI || "http://localhost/callback",
    },
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || "",
  },

  // 應用程序配置
  app: {
    env: process.env.NODE_ENV || "development",
    logLevel: process.env.LOG_LEVEL || "info",
  },

  // API 端點
  endpoints: {
    auth: "/v1/auth",
    videos: "/v1/videos",
    users: "/v1/users",
    timelines: "/v1/timelines",
    upload: "/v1/upload",
  },
};

module.exports = config;
