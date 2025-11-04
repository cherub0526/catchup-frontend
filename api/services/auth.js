/**
 * 認證服務
 * 處理登入、登出、註冊等認證相關的 API 請求
 */

const apiClient = require("../client");
const config = require("../config");

class AuthService {
  /**
   * 使用者登入
   * @param {string} account - 帳號
   * @param {string} password - 密碼
   * @returns {Promise<Object>} - 用戶資訊和 token
   */
  async login(account, password) {
    try {
      const response = await apiClient.post(config.endpoints.auth, {
        account,
        password,
      });

      if (response.data.token) {
        apiClient.setToken(response.data.token);
        // 儲存 token 到本地存儲
        this.saveToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error("登入失敗:", error);
      throw error;
    }
  }

  /**
   * 使用者註冊
   * @param {Object} userData - 用戶資料
   * @returns {Promise<Object>} - 註冊結果
   */
  async register(userData) {
    try {
      const response = await apiClient.post(config.endpoints.auth + "/register", userData);
      return response.data;
    } catch (error) {
      // console.error("註冊失敗:", error.text());
      throw error;
    }
  }

  /**
   * OAuth 登入
   * @param {string} provider - OAuth 提供商 (google, facebook)
   * @param {string} code - 授權碼
   * @returns {Promise<Object>} - 用戶資訊和 token
   */
  async oauthLogin(provider, code) {
    try {
      const response = await apiClient.post(config.endpoints.auth + "/oauth", {
        provider,
        code,
      });

      if (response.data.token) {
        apiClient.setToken(response.data.token);
        this.saveToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error("OAuth 登入失敗:", error.message);
      throw error;
    }
  }

  /**
   * 登出
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiClient.post(config.endpoints.auth + "/logout");
      apiClient.setToken(null);
      this.clearToken();
    } catch (error) {
      console.error("登出失敗:", error.message);
      // 即使 API 調用失敗，也清除本地 token
      apiClient.setToken(null);
      this.clearToken();
    }
  }

  /**
   * 刷新 token
   * @returns {Promise<string>} - 新的 token
   */
  async refreshToken() {
    try {
      const response = await apiClient.post(config.endpoints.auth + "/refresh");

      if (response.data.token) {
        apiClient.setToken(response.data.token);
        this.saveToken(response.data.token);
      }

      return response.data.token;
    } catch (error) {
      console.error("刷新 token 失敗:", error.message);
      throw error;
    }
  }

  /**
   * 驗證當前 token
   * @returns {Promise<boolean>} - token 是否有效
   */
  async verifyToken() {
    try {
      const response = await apiClient.get(config.endpoints.auth + "/verify");
      return response.data.valid === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 儲存 token
   * @param {string} token
   */
  saveToken(token) {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("auth_token", token);
    }
  }

  /**
   * 讀取 token
   * @returns {string|null}
   */
  getToken() {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  /**
   * 清除 token
   */
  clearToken() {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("auth_token");
    }
  }

  /**
   * 初始化認證（從本地存儲載入 token）
   */
  initialize() {
    const token = this.getToken();
    if (token) {
      apiClient.setToken(token);
    }
  }
}

module.exports = new AuthService();
