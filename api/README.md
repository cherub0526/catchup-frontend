# API 模組使用說明

## 概述

本 API 模組提供了一個完整的 HTTP 客戶端架構，用於與後端 API 進行通信。模組設計遵循單一職責原則，將不同的 API 功能分離到不同的服務中。

## 目錄結構

```
api/
├── index.js              # API 模組入口文件
├── config.js             # API 配置模組
├── client.js             # HTTP 客戶端
├── services/             # API 服務目錄
│   ├── auth.js          # 認證服務
│   ├── videos.js        # 影片服務
│   └── user.js          # 用戶服務
└── README.md            # 本文件
```

## 環境變數配置

### 1. 創建 .env 檔案

在項目根目錄創建 `.env` 檔案：

```bash
# API 配置
API_BASE_URL=https://local.cherub0526.qzz.io
API_TIMEOUT=30000

# OAuth 配置
GOOGLE_CLIENT_ID=你的_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost/callback

FACEBOOK_APP_ID=你的_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=你的_FACEBOOK_APP_SECRET
FACEBOOK_REDIRECT_URI=http://localhost/callback

# 應用程序配置
NODE_ENV=development
LOG_LEVEL=debug

# JWT 配置
JWT_SECRET=你的-jwt-secret-key
```

### 2. 確保 .env 在 .gitignore 中

確認 `.gitignore` 檔案包含：

```
.env
config.js
```

## 使用方法

### 基本使用

在主進程或渲染進程中引入 API 模組：

```javascript
// 引入整個 API 模組
const api = require("./api");

// 或引入特定服務
const { auth, videos, user } = require("./api");
```

### 認證服務 (auth)

#### 登入

```javascript
const api = require("./api");

async function login() {
  try {
    const result = await api.auth.login("user@example.com", "password123");
    console.log("登入成功:", result);
    // { token: 'jwt-token', user: { id, email, name, ... } }
  } catch (error) {
    console.error("登入失敗:", error.message);
  }
}
```

#### OAuth 登入

```javascript
async function oauthLogin(provider, authCode) {
  try {
    const result = await api.auth.oauthLogin(provider, authCode);
    console.log("OAuth 登入成功:", result);
  } catch (error) {
    console.error("OAuth 登入失敗:", error.message);
  }
}

// 在 OAuth 回調中使用
oauthLogin("google", authorizationCode);
```

#### 登出

```javascript
async function logout() {
  try {
    await api.auth.logout();
    console.log("登出成功");
  } catch (error) {
    console.error("登出失敗:", error.message);
  }
}
```

#### 初始化認證

在應用程序啟動時初始化認證（自動從 localStorage 載入 token）：

```javascript
// 在 main.js 中已經自動初始化
// api.auth.initialize();
```

### 影片服務 (videos)

#### 獲取影片列表

```javascript
async function getVideos() {
  try {
    const result = await api.videos.getVideos({
      page: 1,
      limit: 20,
      sort: "createdAt",
      order: "desc",
    });
    console.log("影片列表:", result);
    // { videos: [...], total: 100, page: 1, limit: 20 }
  } catch (error) {
    console.error("獲取影片失敗:", error.message);
  }
}
```

#### 獲取單一影片

```javascript
async function getVideo(videoId) {
  try {
    const video = await api.videos.getVideoById(videoId);
    console.log("影片詳情:", video);
  } catch (error) {
    console.error("獲取影片失敗:", error.message);
  }
}
```

#### 上傳影片

```javascript
async function uploadVideo(file) {
  try {
    const result = await api.videos.uploadVideo(file, {
      title: "我的影片",
      description: "影片描述",
      tags: ["tag1", "tag2"],
    });
    console.log("上傳成功:", result);
  } catch (error) {
    console.error("上傳失敗:", error.message);
  }
}
```

#### 更新影片

```javascript
async function updateVideo(videoId) {
  try {
    const result = await api.videos.updateVideo(videoId, {
      title: "更新後的標題",
      description: "更新後的描述",
    });
    console.log("更新成功:", result);
  } catch (error) {
    console.error("更新失敗:", error.message);
  }
}
```

#### 獲取和更新時間軸

```javascript
// 獲取時間軸
async function getTimeline(videoId) {
  try {
    const timeline = await api.videos.getVideoTimeline(videoId);
    console.log("時間軸:", timeline);
  } catch (error) {
    console.error("獲取時間軸失敗:", error.message);
  }
}

// 更新時間軸
async function updateTimeline(videoId, timelineData) {
  try {
    const result = await api.videos.updateVideoTimeline(videoId, timelineData);
    console.log("時間軸更新成功:", result);
  } catch (error) {
    console.error("更新時間軸失敗:", error.message);
  }
}
```

#### 搜尋影片

```javascript
async function searchVideos(query) {
  try {
    const results = await api.videos.searchVideos(query, {
      category: "education",
      duration: "medium",
    });
    console.log("搜尋結果:", results);
  } catch (error) {
    console.error("搜尋失敗:", error.message);
  }
}
```

### 用戶服務 (user)

#### 獲取當前用戶資訊

```javascript
async function getCurrentUser() {
  try {
    const user = await api.user.getCurrentUser();
    console.log("用戶資訊:", user);
  } catch (error) {
    console.error("獲取用戶資訊失敗:", error.message);
  }
}
```

#### 更新用戶資訊

```javascript
async function updateUserInfo() {
  try {
    const result = await api.user.updateUser({
      name: "新名稱",
      bio: "個人簡介",
    });
    console.log("更新成功:", result);
  } catch (error) {
    console.error("更新失敗:", error.message);
  }
}
```

#### 獲取和更新偏好設置

```javascript
// 獲取偏好設置
async function getPreferences() {
  try {
    const prefs = await api.user.getPreferences();
    console.log("偏好設置:", prefs);
  } catch (error) {
    console.error("獲取失敗:", error.message);
  }
}

// 更新偏好設置
async function updatePreferences() {
  try {
    const result = await api.user.updatePreferences({
      language: "zh-TW",
      theme: "dark",
      notifications: true,
    });
    console.log("更新成功:", result);
  } catch (error) {
    console.error("更新失敗:", error.message);
  }
}
```

## 在渲染進程中使用

如果需要在渲染進程（網頁）中使用 API，有兩種方式：

### 方式 1：透過 IPC 通信（推薦）

在主進程中處理 API 請求：

```javascript
// main.js
const api = require("./api");

ipcMain.handle("api:getVideos", async (event, params) => {
  try {
    return await api.videos.getVideos(params);
  } catch (error) {
    throw error;
  }
});
```

在渲染進程中調用：

```javascript
// pages/scripts/dashboard.js
const { ipcRenderer } = require("electron");

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
```

### 方式 2：直接使用（需要 nodeIntegration）

如果已經啟用 `nodeIntegration: true`，可以直接在渲染進程中使用：

```javascript
// pages/scripts/dashboard.js
const api = require("../../api");

async function loadVideos() {
  const videos = await api.videos.getVideos();
  // 處理影片資料...
}
```

## 錯誤處理

所有 API 方法都會拋出錯誤，建議使用 try-catch 處理：

```javascript
async function safeApiCall() {
  try {
    const result = await api.videos.getVideos();
    return result;
  } catch (error) {
    // 錯誤處理
    console.error("API 錯誤:", error.message);

    // 可以根據錯誤類型進行不同處理
    if (error.message.includes("401")) {
      // Token 過期，重新登入
      await api.auth.logout();
      // 跳轉到登入頁面
    } else if (error.message.includes("網路")) {
      // 網路錯誤
      alert("網路連接失敗，請檢查網路設置");
    }

    return null;
  }
}
```

## 自訂配置

### 修改 API 基礎 URL

```javascript
const api = require("./api");

// 臨時修改
api.apiClient.baseUrl = "https://other-api.example.com";

// 或在 .env 中設置
// API_BASE_URL=https://other-api.example.com
```

### 設置自訂請求頭

```javascript
// 在 api/client.js 中修改
apiClient.headers["X-Custom-Header"] = "custom-value";
```

## 開發建議

1. **始終使用 try-catch** 處理 API 調用
2. **檢查 token 有效性** 在應用啟動時
3. **適當的錯誤提示** 給用戶友好的錯誤訊息
4. **使用 IPC** 在渲染進程和主進程之間通信
5. **環境變數** 不要將敏感資訊提交到版本控制

## 擴展 API

如果需要添加新的 API 服務，請按照以下步驟：

1. 在 `api/services/` 創建新的服務文件
2. 使用 `apiClient` 發送請求
3. 在 `api/index.js` 中導出新服務

例如，添加評論服務：

```javascript
// api/services/comments.js
const apiClient = require("../client");
const config = require("../config");

class CommentService {
  async getComments(videoId) {
    const response = await apiClient.get(`/api/videos/${videoId}/comments`);
    return response.data;
  }

  async addComment(videoId, text) {
    const response = await apiClient.post(`/api/videos/${videoId}/comments`, { text });
    return response.data;
  }
}

module.exports = new CommentService();
```

然後在 `api/index.js` 中添加：

```javascript
const commentService = require("./services/comments");

module.exports = {
  // ...
  comments: commentService,
};
```

## 測試

建議為每個服務編寫單元測試：

```javascript
// 示例測試
const api = require("./api");

describe("AuthService", () => {
  test("login should return user and token", async () => {
    const result = await api.auth.login("test@example.com", "password");
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
  });
});
```

## 常見問題

### Q: API_BASE_URL 沒有生效？

A: 確保：

1. `.env` 檔案在項目根目錄
2. `main.js` 開頭有 `require('dotenv').config()`
3. 已安裝 `dotenv` 套件

### Q: 渲染進程中無法使用 API？

A: 建議透過 IPC 通信，或確保 `nodeIntegration: true` 和 `contextIsolation: false`。

### Q: Token 沒有自動附加到請求？

A: 確保調用了 `api.auth.initialize()` 或登入後 token 會自動設置。

## 支援

如有問題，請查看：

- [項目文檔](../docs/)
- [OAuth 設置指南](../docs/OAUTH_SETUP.md)
- [快速開始](../docs/QUICKSTART.md)
