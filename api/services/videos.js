/**
 * 影片服務
 * 處理影片相關的 API 請求
 */

const apiClient = require("../client");
const config = require("../config");

class VideoService {
  /**
   * 獲取影片列表
   * @param {Object} params - 查詢參數 (page, limit, sort, filter 等)
   * @returns {Promise<Object>} - 影片列表和分頁資訊
   */
  async getVideos(params = {}) {
    try {
      const response = await apiClient.get(config.endpoints.videos, params);
      return response.data;
    } catch (error) {
      console.error("獲取影片列表失敗:", error.message);
      throw error;
    }
  }

  /**
   * 獲取單一影片詳情
   * @param {string} videoId - 影片 ID
   * @returns {Promise<Object>} - 影片詳細資訊
   */
  async getVideoById(videoId) {
    try {
      const response = await apiClient.get(`${config.endpoints.videos}/${videoId}`);
      return response.data;
    } catch (error) {
      console.error("獲取影片詳情失敗:", error.message);
      throw error;
    }
  }

  /**
   * 上傳影片
   * @param {File} file - 影片檔案
   * @param {Object} metadata - 影片元數據
   * @returns {Promise<Object>} - 上傳結果
   */
  async uploadVideo(file, metadata = {}) {
    try {
      const response = await apiClient.upload(config.endpoints.upload, file, metadata);
      return response.data;
    } catch (error) {
      console.error("上傳影片失敗:", error.message);
      throw error;
    }
  }

  /**
   * 更新影片資訊
   * @param {string} videoId - 影片 ID
   * @param {Object} data - 更新的資料
   * @returns {Promise<Object>} - 更新後的影片資訊
   */
  async updateVideo(videoId, data) {
    try {
      const response = await apiClient.put(`${config.endpoints.videos}/${videoId}`, data);
      return response.data;
    } catch (error) {
      console.error("更新影片失敗:", error.message);
      throw error;
    }
  }

  /**
   * 刪除影片
   * @param {string} videoId - 影片 ID
   * @returns {Promise<void>}
   */
  async deleteVideo(videoId) {
    try {
      await apiClient.delete(`${config.endpoints.videos}/${videoId}`);
    } catch (error) {
      console.error("刪除影片失敗:", error.message);
      throw error;
    }
  }

  /**
   * 獲取影片時間軸
   * @param {string} videoId - 影片 ID
   * @returns {Promise<Array>} - 時間軸資料
   */
  async getVideoTimeline(videoId) {
    try {
      const response = await apiClient.get(`${config.endpoints.videos}/${videoId}/timeline`);
      return response.data;
    } catch (error) {
      console.error("獲取時間軸失敗:", error.message);
      throw error;
    }
  }

  /**
   * 更新影片時間軸
   * @param {string} videoId - 影片 ID
   * @param {Array} timeline - 時間軸資料
   * @returns {Promise<Object>} - 更新結果
   */
  async updateVideoTimeline(videoId, timeline) {
    try {
      const response = await apiClient.put(`${config.endpoints.videos}/${videoId}/timeline`, { timeline });
      return response.data;
    } catch (error) {
      console.error("更新時間軸失敗:", error.message);
      throw error;
    }
  }

  /**
   * 搜尋影片
   * @param {string} query - 搜尋關鍵字
   * @param {Object} filters - 篩選條件
   * @returns {Promise<Object>} - 搜尋結果
   */
  async searchVideos(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters,
      };
      const response = await apiClient.get(`${config.endpoints.videos}/search`, params);
      return response.data;
    } catch (error) {
      console.error("搜尋影片失敗:", error.message);
      throw error;
    }
  }

  /**
   * 獲取影片統計資訊
   * @param {string} videoId - 影片 ID
   * @returns {Promise<Object>} - 統計資訊
   */
  async getVideoStats(videoId) {
    try {
      const response = await apiClient.get(`${config.endpoints.videos}/${videoId}/stats`);
      return response.data;
    } catch (error) {
      console.error("獲取影片統計失敗:", error.message);
      throw error;
    }
  }
}

module.exports = new VideoService();
