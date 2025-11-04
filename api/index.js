/**
 * API 模組入口文件
 * 統一導出所有 API 服務
 */

const apiClient = require("./client");
const config = require("./config");
const authService = require("./services/auth");
const videoService = require("./services/videos");
const userService = require("./services/user");

// 初始化認證
authService.initialize();

module.exports = {
  // 客戶端和配置
  apiClient,
  config,

  // 服務
  auth: authService,
  videos: videoService,
  user: userService,
};
