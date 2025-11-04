/**
 * 用戶服務
 * 處理用戶相關的 API 請求
 */

const apiClient = require("../client");
const config = require("../config");

class UserService {
  /**
   * 獲取當前用戶資訊
   * @returns {Promise<Object>} - 用戶資訊
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get(`${config.endpoints.users}/me`);
      return response.data;
    } catch (error) {
      console.error("獲取用戶資訊失敗:", error.message);
      throw error;
    }
  }

  /**
   * 更新用戶資訊
   * @param {Object} data - 更新的資料
   * @returns {Promise<Object>} - 更新後的用戶資訊
   */
  async updateUser(data) {
    try {
      const response = await apiClient.put(`${config.endpoints.users}/me`, data);
      return response.data;
    } catch (error) {
      console.error("更新用戶資訊失敗:", error.message);
      throw error;
    }
  }

  /**
   * 更改密碼
   * @param {string} oldPassword - 舊密碼
   * @param {string} newPassword - 新密碼
   * @returns {Promise<void>}
   */
  async changePassword(oldPassword, newPassword) {
    try {
      await apiClient.post(`${config.endpoints.users}/me/password`, {
        oldPassword,
        newPassword,
      });
    } catch (error) {
      console.error("更改密碼失敗:", error.message);
      throw error;
    }
  }

  /**
   * 上傳頭像
   * @param {File} file - 頭像檔案
   * @returns {Promise<Object>} - 包含頭像 URL 的物件
   */
  async uploadAvatar(file) {
    try {
      const response = await apiClient.upload(`${config.endpoints.users}/me/avatar`, file);
      return response.data;
    } catch (error) {
      console.error("上傳頭像失敗:", error.message);
      throw error;
    }
  }

  /**
   * 獲取用戶偏好設置
   * @returns {Promise<Object>} - 偏好設置
   */
  async getPreferences() {
    try {
      const response = await apiClient.get(`${config.endpoints.users}/me/preferences`);
      return response.data;
    } catch (error) {
      console.error("獲取偏好設置失敗:", error.message);
      throw error;
    }
  }

  /**
   * 更新用戶偏好設置
   * @param {Object} preferences - 偏好設置
   * @returns {Promise<Object>} - 更新後的偏好設置
   */
  async updatePreferences(preferences) {
    try {
      const response = await apiClient.put(`${config.endpoints.users}/me/preferences`, preferences);
      return response.data;
    } catch (error) {
      console.error("更新偏好設置失敗:", error.message);
      throw error;
    }
  }

  /**
   * 獲取用戶的影片列表
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>} - 影片列表
   */
  async getUserVideos(params = {}) {
    try {
      const response = await apiClient.get(`${config.endpoints.users}/me/videos`, params);
      return response.data;
    } catch (error) {
      console.error("獲取用戶影片列表失敗:", error.message);
      throw error;
    }
  }

  /**
   * 獲取用戶統計資訊
   * @returns {Promise<Object>} - 統計資訊
   */
  async getUserStats() {
    try {
      const response = await apiClient.get(`${config.endpoints.users}/me/stats`);
      return response.data;
    } catch (error) {
      console.error("獲取用戶統計失敗:", error.message);
      throw error;
    }
  }

  /**
   * 刪除用戶帳戶
   * @param {string} password - 確認密碼
   * @returns {Promise<void>}
   */
  async deleteAccount(password) {
    try {
      await apiClient.delete(`${config.endpoints.users}/me`, {
        password,
      });
    } catch (error) {
      console.error("刪除帳戶失敗:", error.message);
      throw error;
    }
  }
}

module.exports = new UserService();
