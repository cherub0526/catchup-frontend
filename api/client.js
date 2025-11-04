/**
 * API 客戶端模組
 * 處理所有的 HTTP 請求
 */

const https = require("https");
const http = require("http");
const config = require("./config");

class ApiClient {
  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.token = null;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * 設置認證 token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      this.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.headers["Authorization"];
    }
  }

  /**
   * 發送 HTTP 請求
   * @param {string} method - HTTP 方法
   * @param {string} endpoint - API 端點
   * @param {Object} data - 請求數據
   * @param {Object} customHeaders - 自訂請求頭
   * @returns {Promise<Object>} - 回應數據
   */
  async request(method, endpoint, data = null, customHeaders = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const isHttps = url.protocol === "https:";
      const lib = isHttps ? https : http;

      const options = {
        method: method.toUpperCase(),
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          ...this.headers,
          ...customHeaders,
        },
        timeout: this.timeout,
      };

      // 如果有數據且不是 GET 請求，添加 Content-Length
      let postData = null;
      if (data && method.toUpperCase() !== "GET") {
        postData = JSON.stringify(data);
        options.headers["Content-Length"] = Buffer.byteLength(postData);
      }

      const req = lib.request(options, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            const response = {
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: res.headers,
              data: body ? JSON.parse(body) : null,
            };

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(response);
            }
          } catch (error) {
            reject(new Error(`解析回應失敗: ${error.message}`));
          }
        });
      });

      // req.on("error", (error) => {
      //   console.error("error: " + error.response.data);
      //   reject(error);
      //   // reject(new Error(`請求失敗: ${error.message}`));
      // });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("請求超時"));
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }

  /**
   * GET 請求
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request("GET", url);
  }

  /**
   * POST 請求
   */
  async post(endpoint, data = {}) {
    return this.request("POST", endpoint, data);
  }

  /**
   * PUT 請求
   */
  async put(endpoint, data = {}) {
    return this.request("PUT", endpoint, data);
  }

  /**
   * PATCH 請求
   */
  async patch(endpoint, data = {}) {
    return this.request("PATCH", endpoint, data);
  }

  /**
   * DELETE 請求
   */
  async delete(endpoint) {
    return this.request("DELETE", endpoint);
  }

  /**
   * 上傳檔案
   */
  async upload(endpoint, file, additionalData = {}) {
    // 這裡需要實作 multipart/form-data 上傳
    // 可以使用 form-data 套件
    throw new Error("檔案上傳功能需要額外實作");
  }
}

// 創建單例
const apiClient = new ApiClient();

module.exports = apiClient;
