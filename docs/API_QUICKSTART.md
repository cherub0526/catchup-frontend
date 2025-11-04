# API 快速入門指南

## 🚀 5 分鐘快速設置

### 步驟 1：安裝依賴

```bash
npm install dotenv axios
```

### 步驟 2：配置環境變數

```bash
# 複製環境變數範本
cp env.template .env

# 編輯 .env 檔案，填入您的 API 網域
# API_BASE_URL=https://local.cherub0526.qzz.io
```

### 步驟 3：開始使用

```javascript
const api = require("./api");

// 登入
await api.auth.login("user@example.com", "password");

// 獲取影片列表
const videos = await api.videos.getVideos();

// 獲取用戶資訊
const user = await api.user.getCurrentUser();
```

## 📁 檔案結構一覽

```
video-assistant/
├── api/                          # ← API 核心模組
│   ├── index.js                 # 入口文件（從這裡開始）
│   ├── config.js                # 配置管理
│   ├── client.js                # HTTP 客戶端
│   ├── services/                # API 服務
│   │   ├── auth.js             # 🔐 認證服務
│   │   ├── videos.js           # 🎥 影片服務
│   │   └── user.js             # 👤 用戶服務
│   └── README.md               # 詳細使用說明
│
├── .env                         # ⚙️ 環境變數（不提交）
├── env.template                 # 📝 環境變數範本
├── main.js                      # Electron 主進程
└── package.json                 # 依賴配置
```

## 🔑 環境變數配置

在 `.env` 檔案中設置（從 `env.template` 複製）：

```env
# 必填：您的 API 網域
API_BASE_URL=https://local.cherub0526.qzz.io

# 可選：其他配置
API_TIMEOUT=30000
NODE_ENV=development
```

## 💡 常用 API 操作

### 認證 (auth)

```javascript
const api = require("./api");

// 🔓 登入
const result = await api.auth.login("email@example.com", "password123");
// 返回: { token, user: { id, email, name, ... } }

// 🔐 登出
await api.auth.logout();

// 🔄 驗證 Token
const isValid = await api.auth.verifyToken();

// 📱 OAuth 登入
const result = await api.auth.oauthLogin("google", authCode);
```

### 影片 (videos)

```javascript
// 📋 獲取影片列表
const result = await api.videos.getVideos({
  page: 1,
  limit: 20,
  sort: "createdAt",
  order: "desc",
});
// 返回: { videos: [...], total, page, limit }

// 🎬 獲取單一影片
const video = await api.videos.getVideoById("video-id");

// ⬆️ 上傳影片
const result = await api.videos.uploadVideo(file, {
  title: "影片標題",
  description: "影片描述",
});

// ✏️ 更新影片
await api.videos.updateVideo("video-id", { title: "新標題" });

// 🗑️ 刪除影片
await api.videos.deleteVideo("video-id");

// ⏱️ 獲取時間軸
const timeline = await api.videos.getVideoTimeline("video-id");

// 💾 更新時間軸
await api.videos.updateVideoTimeline("video-id", timelineData);

// 🔍 搜尋影片
const results = await api.videos.searchVideos("關鍵字", {
  category: "education",
});
```

### 用戶 (user)

```javascript
// 👤 獲取當前用戶
const user = await api.user.getCurrentUser();
// 返回: { id, email, name, avatar, ... }

// ✏️ 更新用戶資訊
await api.user.updateUser({
  name: "新名稱",
  bio: "個人簡介",
});

// 🔒 更改密碼
await api.user.changePassword("舊密碼", "新密碼");

// 🖼️ 上傳頭像
await api.user.uploadAvatar(file);

// ⚙️ 獲取偏好設置
const prefs = await api.user.getPreferences();

// 💾 更新偏好設置
await api.user.updatePreferences({
  language: "zh-TW",
  theme: "dark",
});

// 📊 獲取用戶統計
const stats = await api.user.getUserStats();
```

## 🎯 在不同位置使用 API

### 在主進程中 (main.js)

```javascript
// 已經自動載入
require("dotenv").config();
const api = require("./api");

app.on("ready", async () => {
  // 檢查認證狀態
  const isAuth = await api.auth.verifyToken();

  if (isAuth) {
    createMainWindow();
  } else {
    createLoginWindow();
  }
});
```

### 在渲染進程中（網頁）

#### 方式 1：直接使用（需要 nodeIntegration: true）

```javascript
// pages/scripts/dashboard.js
const api = require("../../api");

async function loadData() {
  try {
    const videos = await api.videos.getVideos();
    displayVideos(videos);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

#### 方式 2：透過 IPC（推薦）

主進程：

```javascript
// main.js
const { ipcMain } = require("electron");

ipcMain.handle("api:getVideos", async (event, params) => {
  return await api.videos.getVideos(params);
});
```

渲染進程：

```javascript
// pages/scripts/dashboard.js
const { ipcRenderer } = require("electron");

async function loadData() {
  const videos = await ipcRenderer.invoke("api:getVideos", { page: 1 });
  displayVideos(videos);
}
```

## ⚠️ 錯誤處理

**始終使用 try-catch 處理 API 調用：**

```javascript
async function safeApiCall() {
  try {
    const result = await api.videos.getVideos();
    return result;
  } catch (error) {
    console.error("API Error:", error.message);

    // 根據錯誤類型處理
    if (error.message.includes("401")) {
      // 認證失敗，返回登入頁面
      window.location.href = "login.html";
    } else {
      // 顯示錯誤訊息
      alert("操作失敗：" + error.message);
    }

    return null;
  }
}
```

## 🔒 認證流程

### 1. 用戶登入

```javascript
// 登入
const result = await api.auth.login("email@example.com", "password");

// Token 自動保存到 localStorage
// Token 自動設置到 HTTP 客戶端
// 後續所有請求自動包含 Authorization header
```

### 2. 應用啟動時

```javascript
// API 模組自動初始化
// 從 localStorage 讀取 token
// 設置到 HTTP 客戶端
api.auth.initialize(); // 已在 api/index.js 中自動執行
```

### 3. 驗證 Token

```javascript
const isValid = await api.auth.verifyToken();
if (!isValid) {
  // Token 無效，返回登入頁面
  window.location.href = "login.html";
}
```

## 📊 API 端點對應表

| 功能     | 方法                        | API 端點                        |
| -------- | --------------------------- | ------------------------------- |
| **認證** |
| 登入     | `api.auth.login()`          | `POST /api/auth/login`          |
| 登出     | `api.auth.logout()`         | `POST /api/auth/logout`         |
| OAuth    | `api.auth.oauthLogin()`     | `POST /api/auth/oauth`          |
| **影片** |
| 列表     | `api.videos.getVideos()`    | `GET /api/videos`               |
| 詳情     | `api.videos.getVideoById()` | `GET /api/videos/:id`           |
| 上傳     | `api.videos.uploadVideo()`  | `POST /api/upload`              |
| 更新     | `api.videos.updateVideo()`  | `PUT /api/videos/:id`           |
| 刪除     | `api.videos.deleteVideo()`  | `DELETE /api/videos/:id`        |
| 搜尋     | `api.videos.searchVideos()` | `GET /api/videos/search`        |
| **用戶** |
| 資訊     | `api.user.getCurrentUser()` | `GET /api/users/me`             |
| 更新     | `api.user.updateUser()`     | `PUT /api/users/me`             |
| 偏好     | `api.user.getPreferences()` | `GET /api/users/me/preferences` |

## 🛠️ 開發工具

### 啟用開發者工具

```javascript
// main.js
if (process.env.NODE_ENV === "development") {
  mainWindow.webContents.openDevTools();
}
```

### 查看 API 日誌

在 `.env` 中設置：

```env
LOG_LEVEL=debug
```

### 測試 API 連接

```javascript
const api = require("./api");

console.log("API Base URL:", api.config.api.baseUrl);
// 輸出: https://local.cherub0526.qzz.io
```

## 📝 完整範例

### 登入頁面範例

```javascript
// pages/scripts/login.js
const api = require("../../api");
const { ipcRenderer } = require("electron");

// 表單提交處理
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // 顯示載入狀態
    showLoading(true);

    // 調用登入 API
    const result = await api.auth.login(email, password);

    console.log("登入成功:", result.user);

    // 通知主進程
    ipcRenderer.send("login-success", result.user);
  } catch (error) {
    console.error("登入失敗:", error.message);
    showError("登入失敗：" + error.message);
  } finally {
    showLoading(false);
  }
});

function showLoading(show) {
  const btn = document.querySelector('button[type="submit"]');
  btn.disabled = show;
  btn.textContent = show ? "登入中..." : "登入";
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}
```

### 儀表板頁面範例

```javascript
// pages/scripts/dashboard.js
const api = require("../../api");

let currentPage = 1;
const pageSize = 20;

// 載入影片列表
async function loadVideos() {
  try {
    showLoading(true);

    const result = await api.videos.getVideos({
      page: currentPage,
      limit: pageSize,
      sort: "createdAt",
      order: "desc",
    });

    displayVideos(result.videos);
    updatePagination(result.total);
  } catch (error) {
    console.error("Error:", error);
    if (error.message.includes("401")) {
      window.location.href = "login.html";
    }
  } finally {
    showLoading(false);
  }
}

// 搜尋影片
async function searchVideos() {
  const query = document.getElementById("search-input").value;

  try {
    const result = await api.videos.searchVideos(query);
    displayVideos(result.videos);
  } catch (error) {
    console.error("Search error:", error);
  }
}

// 顯示影片
function displayVideos(videos) {
  const container = document.getElementById("video-grid");
  container.innerHTML = "";

  videos.forEach((video) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <h3>${video.title}</h3>
      <p>${video.description}</p>
      <button onclick="playVideo('${video.id}')">播放</button>
    `;
    container.appendChild(card);
  });
}

// 播放影片
function playVideo(videoId) {
  window.location.href = `player.html?id=${videoId}`;
}

// 頁面載入時執行
window.addEventListener("DOMContentLoaded", () => {
  loadVideos();

  // 設置搜尋事件
  document.getElementById("search-btn").addEventListener("click", searchVideos);
});

function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
}
```

## 🔧 故障排除

### 問題 1: API_BASE_URL 沒有生效

**解決方法**：

1. 確認 `.env` 檔案在項目根目錄
2. 確認 `main.js` 開頭有 `require('dotenv').config()`
3. 重新啟動應用程序

### 問題 2: 請求時沒有 Token

**解決方法**：

```javascript
// 檢查 token 是否存在
console.log("Token:", api.auth.getToken());

// 手動設置 token
api.apiClient.setToken("your-token");
```

### 問題 3: CORS 錯誤

**解決方法**：
確保後端 API 設置了正確的 CORS headers：

```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

### 問題 4: 渲染進程無法使用 API

**解決方法**：
確認 `BrowserWindow` 配置：

```javascript
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false,
}
```

## 📚 更多資源

- [完整 API 文檔](./api/README.md) - 詳細的 API 使用說明
- [檔案結構說明](./API_STRUCTURE.md) - 完整的架構說明
- [集成指南](./docs/API_INTEGRATION.md) - 深入的集成指南
- [OAuth 設置](./docs/OAUTH_SETUP.md) - OAuth 配置教程

## ✅ 檢查清單

在開始使用 API 之前，請確認：

- [ ] 已安裝 `dotenv` 和 `axios` 套件
- [ ] 已創建 `.env` 檔案並配置 `API_BASE_URL`
- [ ] `.env` 已添加到 `.gitignore`
- [ ] `main.js` 開頭有載入 `dotenv`
- [ ] 測試 API 連接正常

## 💬 需要幫助？

如果遇到問題：

1. 檢查控制台錯誤訊息
2. 確認網路連接
3. 驗證 API 端點是否正確
4. 查看 [故障排除](#-故障排除) 章節
5. 閱讀詳細文檔

---

**開始使用 API 吧！** 🚀

```javascript
const api = require("./api");

// 您的第一個 API 調用
const result = await api.videos.getVideos();
console.log("Success!", result);
```
