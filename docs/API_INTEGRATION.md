# API 集成指南

## 概述

本文檔說明如何在 Video Assistant 應用程序中集成和使用 API 模組。

## 檔案結構

```
video-assistant/
├── api/                          # API 模組目錄
│   ├── index.js                 # API 入口文件
│   ├── config.js                # 配置管理
│   ├── client.js                # HTTP 客戶端
│   ├── services/                # API 服務
│   │   ├── auth.js             # 認證服務
│   │   ├── videos.js           # 影片服務
│   │   └── user.js             # 用戶服務
│   └── README.md               # API 使用說明
├── .env                         # 環境變數配置（不提交到 Git）
├── env.template                 # 環境變數範本
├── main.js                      # Electron 主進程
└── pages/                       # 前端頁面
    └── scripts/                 # 前端腳本
        ├── login.js
        ├── dashboard.js
        └── player.js
```

## 快速開始

### 1. 安裝依賴

```bash
npm install dotenv axios
```

### 2. 配置環境變數

複製環境變數範本並填入您的配置：

```bash
cp env.template .env
```

編輯 `.env` 檔案：

```env
API_BASE_URL=https://local.cherub0526.qzz.io
GOOGLE_CLIENT_ID=你的_CLIENT_ID
GOOGLE_CLIENT_SECRET=你的_CLIENT_SECRET
# ... 其他配置
```

### 3. 在主進程中載入 API

`main.js` 已經自動載入了 API 模組：

```javascript
// 載入環境變數
require("dotenv").config();

const api = require("./api");
```

## 集成範例

### 在登入頁面使用 API

更新 `pages/scripts/login.js`：

```javascript
const { ipcRenderer } = require("electron");
const api = require("../../api");

// 傳統登入
async function handleLogin(email, password) {
  try {
    const result = await api.auth.login(email, password);
    console.log("登入成功:", result);

    // 通知主進程登入成功
    ipcRenderer.send("login-success", result.user);
  } catch (error) {
    console.error("登入失敗:", error.message);
    showError("登入失敗：" + error.message);
  }
}

// OAuth 登入
async function handleOAuthLogin(provider, authCode) {
  try {
    const result = await api.auth.oauthLogin(provider, authCode);
    console.log("OAuth 登入成功:", result);
    ipcRenderer.send("login-success", result.user);
  } catch (error) {
    console.error("OAuth 登入失敗:", error.message);
    showError("登入失敗：" + error.message);
  }
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}
```

### 在儀表板頁面使用 API

更新 `pages/scripts/dashboard.js`：

```javascript
const api = require("../../api");

// 載入影片列表
async function loadVideos() {
  try {
    const result = await api.videos.getVideos({
      page: 1,
      limit: 20,
      sort: "createdAt",
      order: "desc",
    });

    displayVideos(result.videos);
    updatePagination(result.page, result.total, result.limit);
  } catch (error) {
    console.error("載入影片失敗:", error.message);

    // 如果是認證錯誤，返回登入頁面
    if (error.message.includes("401")) {
      window.location.href = "login.html";
    }
  }
}

// 搜尋影片
async function searchVideos(query) {
  try {
    const results = await api.videos.searchVideos(query);
    displayVideos(results.videos);
  } catch (error) {
    console.error("搜尋失敗:", error.message);
  }
}

// 上傳影片
async function uploadVideo(file, metadata) {
  try {
    const result = await api.videos.uploadVideo(file, metadata);
    console.log("上傳成功:", result);

    // 重新載入影片列表
    await loadVideos();
  } catch (error) {
    console.error("上傳失敗:", error.message);
    alert("上傳失敗：" + error.message);
  }
}

// 顯示影片列表
function displayVideos(videos) {
  const container = document.getElementById("video-container");
  if (!container) return;

  container.innerHTML = "";

  videos.forEach((video) => {
    const videoCard = createVideoCard(video);
    container.appendChild(videoCard);
  });
}

// 創建影片卡片
function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";
  card.innerHTML = `
    <img src="${video.thumbnail}" alt="${video.title}">
    <h3>${video.title}</h3>
    <p>${video.description}</p>
    <button onclick="playVideo('${video.id}')">播放</button>
  `;
  return card;
}

// 頁面載入時初始化
window.addEventListener("DOMContentLoaded", () => {
  loadVideos();
});
```

### 在播放器頁面使用 API

更新 `pages/scripts/player.js`：

```javascript
const api = require("../../api");

let currentVideo = null;
let timeline = [];

// 載入影片
async function loadVideo(videoId) {
  try {
    currentVideo = await api.videos.getVideoById(videoId);
    timeline = await api.videos.getVideoTimeline(videoId);

    displayVideo(currentVideo);
    displayTimeline(timeline);
  } catch (error) {
    console.error("載入影片失敗:", error.message);
  }
}

// 更新時間軸
async function updateTimeline(videoId, newTimeline) {
  try {
    const result = await api.videos.updateVideoTimeline(videoId, newTimeline);
    console.log("時間軸更新成功:", result);
    timeline = newTimeline;
  } catch (error) {
    console.error("更新時間軸失敗:", error.message);
  }
}

// 顯示影片
function displayVideo(video) {
  const videoPlayer = document.getElementById("video-player");
  if (videoPlayer) {
    videoPlayer.src = video.url;
    videoPlayer.load();
  }

  document.getElementById("video-title").textContent = video.title;
  document.getElementById("video-description").textContent = video.description;
}

// 顯示時間軸
function displayTimeline(timeline) {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  container.innerHTML = "";

  timeline.forEach((item, index) => {
    const timelineItem = createTimelineItem(item, index);
    container.appendChild(timelineItem);
  });
}

// 從 URL 參數獲取影片 ID 並載入
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("id");

  if (videoId) {
    loadVideo(videoId);
  }
});
```

### 在設置頁面使用 API

更新 `pages/scripts/settings.js`：

```javascript
const api = require("../../api");

// 載入用戶資訊
async function loadUserInfo() {
  try {
    const user = await api.user.getCurrentUser();
    displayUserInfo(user);
  } catch (error) {
    console.error("載入用戶資訊失敗:", error.message);
  }
}

// 載入偏好設置
async function loadPreferences() {
  try {
    const prefs = await api.user.getPreferences();
    displayPreferences(prefs);
  } catch (error) {
    console.error("載入偏好設置失敗:", error.message);
  }
}

// 更新用戶資訊
async function updateUserInfo(data) {
  try {
    const result = await api.user.updateUser(data);
    console.log("更新成功:", result);
    alert("資訊已更新");
  } catch (error) {
    console.error("更新失敗:", error.message);
    alert("更新失敗：" + error.message);
  }
}

// 更新偏好設置
async function updatePreferences(prefs) {
  try {
    const result = await api.user.updatePreferences(prefs);
    console.log("偏好設置已更新:", result);
    alert("設置已保存");
  } catch (error) {
    console.error("更新失敗:", error.message);
    alert("保存失敗：" + error.message);
  }
}

// 更改密碼
async function changePassword(oldPassword, newPassword) {
  try {
    await api.user.changePassword(oldPassword, newPassword);
    alert("密碼已更改");
  } catch (error) {
    console.error("更改密碼失敗:", error.message);
    alert("更改密碼失敗：" + error.message);
  }
}

// 頁面載入時初始化
window.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  loadPreferences();
});
```

## 透過 IPC 使用 API（推薦）

如果您想在主進程中集中管理 API 調用，可以使用 IPC 通信。

### 在主進程中設置 IPC 處理器

在 `main.js` 中添加：

```javascript
const { ipcMain } = require("electron");
const api = require("./api");

// 認證相關
ipcMain.handle("api:login", async (event, { email, password }) => {
  try {
    return await api.auth.login(email, password);
  } catch (error) {
    throw new Error(error.message);
  }
});

ipcMain.handle("api:logout", async () => {
  try {
    return await api.auth.logout();
  } catch (error) {
    throw new Error(error.message);
  }
});

// 影片相關
ipcMain.handle("api:getVideos", async (event, params) => {
  try {
    return await api.videos.getVideos(params);
  } catch (error) {
    throw new Error(error.message);
  }
});

ipcMain.handle("api:getVideoById", async (event, videoId) => {
  try {
    return await api.videos.getVideoById(videoId);
  } catch (error) {
    throw new Error(error.message);
  }
});

ipcMain.handle("api:uploadVideo", async (event, { file, metadata }) => {
  try {
    return await api.videos.uploadVideo(file, metadata);
  } catch (error) {
    throw new Error(error.message);
  }
});

// 用戶相關
ipcMain.handle("api:getCurrentUser", async () => {
  try {
    return await api.user.getCurrentUser();
  } catch (error) {
    throw new Error(error.message);
  }
});

ipcMain.handle("api:updateUser", async (event, data) => {
  try {
    return await api.user.updateUser(data);
  } catch (error) {
    throw new Error(error.message);
  }
});
```

### 在渲染進程中調用

```javascript
const { ipcRenderer } = require("electron");

// 登入
async function login(email, password) {
  try {
    const result = await ipcRenderer.invoke("api:login", { email, password });
    console.log("登入成功:", result);
  } catch (error) {
    console.error("登入失敗:", error.message);
  }
}

// 獲取影片列表
async function getVideos() {
  try {
    const result = await ipcRenderer.invoke("api:getVideos", {
      page: 1,
      limit: 20,
    });
    console.log("影片列表:", result);
  } catch (error) {
    console.error("獲取失敗:", error.message);
  }
}

// 獲取用戶資訊
async function getCurrentUser() {
  try {
    const user = await ipcRenderer.invoke("api:getCurrentUser");
    console.log("用戶資訊:", user);
  } catch (error) {
    console.error("獲取失敗:", error.message);
  }
}
```

## 錯誤處理最佳實踐

### 統一錯誤處理

創建一個錯誤處理工具：

```javascript
// pages/scripts/error-handler.js

class ErrorHandler {
  static handle(error, userMessage = "操作失敗") {
    console.error("Error:", error);

    // 根據錯誤類型顯示不同訊息
    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      this.showError("請重新登入");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else if (error.message.includes("404")) {
      this.showError("資源不存在");
    } else if (error.message.includes("timeout") || error.message.includes("網路")) {
      this.showError("網路連接失敗，請檢查網路設置");
    } else {
      this.showError(userMessage + "：" + error.message);
    }
  }

  static showError(message) {
    // 顯示錯誤訊息
    const errorDiv = document.getElementById("error-toast");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.add("show");

      setTimeout(() => {
        errorDiv.classList.remove("show");
      }, 3000);
    } else {
      alert(message);
    }
  }
}

module.exports = ErrorHandler;
```

使用錯誤處理器：

```javascript
const ErrorHandler = require("./error-handler");
const api = require("../../api");

async function loadVideos() {
  try {
    const result = await api.videos.getVideos();
    displayVideos(result.videos);
  } catch (error) {
    ErrorHandler.handle(error, "載入影片失敗");
  }
}
```

## 認證流程

### 應用啟動時檢查認證狀態

在 `main.js` 中：

```javascript
app.on("ready", async () => {
  // 嘗試驗證現有 token
  const isAuthenticated = await api.auth.verifyToken();

  if (isAuthenticated) {
    createMainWindow();
  } else {
    createLoginWindow();
  }
});
```

### Token 自動刷新

```javascript
// 在 api/client.js 中添加請求攔截器
class ApiClient {
  async request(method, endpoint, data = null, customHeaders = {}) {
    try {
      return await this._makeRequest(method, endpoint, data, customHeaders);
    } catch (error) {
      // 如果是 401 錯誤，嘗試刷新 token
      if (error.message.includes("401")) {
        try {
          await require("./services/auth").refreshToken();
          // 重試請求
          return await this._makeRequest(method, endpoint, data, customHeaders);
        } catch (refreshError) {
          // Token 刷新失敗，清除認證狀態
          require("./services/auth").clearToken();
          throw new Error("認證已過期，請重新登入");
        }
      }
      throw error;
    }
  }
}
```

## 開發和調試

### 啟用詳細日誌

在 `.env` 中設置：

```env
LOG_LEVEL=debug
```

### 使用開發工具

在 `main.js` 中：

```javascript
if (config.app.env === "development") {
  mainWindow.webContents.openDevTools();
}
```

### API 請求監控

在 `api/client.js` 中添加日誌：

```javascript
async request(method, endpoint, data = null, customHeaders = {}) {
  const startTime = Date.now();

  console.log(`[API Request] ${method} ${endpoint}`, data);

  try {
    const response = await this._makeRequest(method, endpoint, data, customHeaders);
    const duration = Date.now() - startTime;

    console.log(`[API Response] ${method} ${endpoint} - ${duration}ms`, response);

    return response;
  } catch (error) {
    console.error(`[API Error] ${method} ${endpoint}`, error);
    throw error;
  }
}
```

## 測試

### 單元測試範例

```javascript
// tests/api/auth.test.js
const api = require("../../api");

describe("Auth Service", () => {
  test("should login successfully", async () => {
    const result = await api.auth.login("test@example.com", "password123");
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
  });

  test("should handle invalid credentials", async () => {
    await expect(api.auth.login("test@example.com", "wrong-password")).rejects.toThrow();
  });
});
```

## 部署注意事項

### 生產環境配置

在 `.env` 中：

```env
NODE_ENV=production
API_BASE_URL=https://api.production.com
LOG_LEVEL=error
```

### 安全性

1. **不要提交 .env 到版本控制**
2. **使用 HTTPS** 進行 API 通信
3. **定期更新依賴** 套件
4. **驗證所有輸入** 數據
5. **實施速率限制** 防止濫用

## 常見問題

### Q: 如何處理大檔案上傳？

A: 實作檔案分塊上傳和進度追蹤：

```javascript
async uploadLargeFile(file, onProgress) {
  const chunkSize = 1024 * 1024; // 1MB
  const chunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    await this.uploadChunk(chunk, i, chunks);

    if (onProgress) {
      onProgress((i + 1) / chunks * 100);
    }
  }
}
```

### Q: 如何實作離線支援？

A: 使用本地存儲快取數據：

```javascript
async getVideos() {
  try {
    const result = await api.videos.getVideos();
    // 快取到本地
    localStorage.setItem('videos_cache', JSON.stringify(result));
    return result;
  } catch (error) {
    // 如果離線，讀取快取
    const cached = localStorage.getItem('videos_cache');
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}
```

## 相關文檔

- [API README](../api/README.md) - 詳細的 API 使用說明
- [OAuth 設置](./OAUTH_SETUP.md) - OAuth 配置指南
- [快速開始](./QUICKSTART.md) - 項目快速入門

## 總結

通過本指南，您應該能夠：

1. ✅ 配置環境變數
2. ✅ 在主進程和渲染進程中使用 API
3. ✅ 處理認證和錯誤
4. ✅ 實作常見的 API 操作
5. ✅ 進行開發和調試

如有任何問題，請參考相關文檔或聯繫技術支援。
