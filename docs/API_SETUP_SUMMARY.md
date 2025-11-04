# API 設置總結

## 📋 已完成的工作

### ✅ 1. API 目錄結構創建

```
api/
├── index.js                 # API 入口文件
├── config.js                # 配置管理（從 .env 讀取）
├── client.js                # HTTP 客戶端
├── services/                # API 服務目錄
│   ├── auth.js             # 認證服務
│   ├── videos.js           # 影片服務
│   └── user.js             # 用戶服務
└── README.md               # API 使用說明
```

### ✅ 2. 環境變數配置

創建了以下檔案：

- `env.template` - 環境變數範本（包含詳細說明）
- `.gitignore` - 確保 .env 不被提交到版本控制

**API 網域配置**：

```env
API_BASE_URL=https://local.cherub0526.qzz.io
```

### ✅ 3. 核心功能實作

#### API 客戶端 (client.js)

- HTTP 請求封裝 (GET, POST, PUT, DELETE, PATCH)
- 自動 Token 管理
- 錯誤處理
- 請求超時控制

#### 認證服務 (auth.js)

- 用戶登入/登出
- OAuth 認證 (Google, Facebook)
- Token 管理（自動保存到 localStorage）
- Token 驗證和刷新

#### 影片服務 (videos.js)

- 獲取影片列表和詳情
- 影片上傳、更新、刪除
- 時間軸管理
- 影片搜尋
- 統計資訊

#### 用戶服務 (user.js)

- 獲取/更新用戶資訊
- 密碼管理
- 頭像上傳
- 偏好設置管理
- 用戶統計

### ✅ 4. 依賴更新

更新了 `package.json`，添加：

```json
"dependencies": {
  "dotenv": "^16.4.5",
  "axios": "^1.7.2"
}
```

### ✅ 5. 主進程集成

更新了 `main.js`：

```javascript
// 載入環境變數
require("dotenv").config();

// 引入 API 模組
const api = require("./api");
```

### ✅ 6. 文檔完善

創建了以下文檔：

- `api/README.md` - 詳細的 API 使用說明
- `docs/API_INTEGRATION.md` - API 集成指南
- `API_STRUCTURE.md` - 檔案結構說明
- `API_QUICKSTART.md` - 快速入門指南
- `docs/API_SETUP_SUMMARY.md` - 本文檔

## 🎯 API 網域配置

您的 API 網域已設置為：

```
https://local.cherub0526.qzz.io
```

可以通過以下方式配置：

### 方式 1：環境變數（推薦）

```bash
# 創建 .env 檔案
cp env.template .env

# 編輯 .env
API_BASE_URL=https://local.cherub0526.qzz.io
```

### 方式 2：直接修改

```javascript
// api/config.js 已自動讀取環境變數
api: {
  baseUrl: process.env.API_BASE_URL || 'https://local.cherub0526.qzz.io',
  // ...
}
```

## 📦 安裝步驟

### 1. 安裝依賴

```bash
npm install
```

這將安裝：

- `dotenv` - 環境變數管理
- `axios` - HTTP 客戶端（可選，目前使用 Node.js 內建模組）

### 2. 配置環境變數

```bash
# 複製範本
cp env.template .env

# 編輯 .env 檔案
nano .env
```

填入您的配置：

```env
API_BASE_URL=https://local.cherub0526.qzz.io
GOOGLE_CLIENT_ID=你的_CLIENT_ID
GOOGLE_CLIENT_SECRET=你的_CLIENT_SECRET
# ... 其他配置
```

### 3. 啟動應用

```bash
npm start
```

## 🚀 使用範例

### 基本使用

```javascript
const api = require("./api");

// 登入
const result = await api.auth.login("user@example.com", "password");

// 獲取影片
const videos = await api.videos.getVideos();

// 獲取用戶資訊
const user = await api.user.getCurrentUser();
```

### 在登入頁面使用

```javascript
// pages/scripts/login.js
const api = require("../../api");

async function handleLogin(email, password) {
  try {
    const result = await api.auth.login(email, password);
    console.log("登入成功:", result);
    // 跳轉到主頁面
  } catch (error) {
    console.error("登入失敗:", error.message);
  }
}
```

### 在儀表板使用

```javascript
// pages/scripts/dashboard.js
const api = require("../../api");

async function loadVideos() {
  try {
    const result = await api.videos.getVideos({ page: 1, limit: 20 });
    displayVideos(result.videos);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## 📚 API 端點結構

所有 API 請求都會發送到：

```
基礎 URL: https://local.cherub0526.qzz.io
```

### 認證相關

```
POST   /api/auth/login          # 登入
POST   /api/auth/logout         # 登出
POST   /api/auth/oauth          # OAuth 登入
POST   /api/auth/refresh        # 刷新 token
GET    /api/auth/verify         # 驗證 token
```

### 影片相關

```
GET    /api/videos              # 獲取影片列表
GET    /api/videos/:id          # 獲取影片詳情
POST   /api/videos              # 創建影片
PUT    /api/videos/:id          # 更新影片
DELETE /api/videos/:id          # 刪除影片
GET    /api/videos/:id/timeline # 獲取時間軸
PUT    /api/videos/:id/timeline # 更新時間軸
GET    /api/videos/search       # 搜尋影片
```

### 用戶相關

```
GET    /api/users/me            # 獲取當前用戶
PUT    /api/users/me            # 更新用戶資訊
POST   /api/users/me/password   # 更改密碼
GET    /api/users/me/preferences # 獲取偏好設置
PUT    /api/users/me/preferences # 更新偏好設置
```

## 🔐 認證機制

### Token 管理

1. **登入時**：API 自動保存 token 到 localStorage
2. **請求時**：自動附加 `Authorization: Bearer <token>` header
3. **登出時**：自動清除 token

### 認證流程

```
用戶登入
  ↓
獲取 JWT Token
  ↓
保存到 localStorage
  ↓
設置到 HTTP 客戶端
  ↓
後續請求自動包含 Token
```

## 🛠️ 配置選項

### 完整的環境變數

```env
# ========================================
# API 配置
# ========================================
API_BASE_URL=https://local.cherub0526.qzz.io
API_TIMEOUT=30000

# ========================================
# OAuth 配置
# ========================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost/callback

# ========================================
# 應用配置
# ========================================
NODE_ENV=development
LOG_LEVEL=debug

# ========================================
# 安全配置
# ========================================
JWT_SECRET=
```

## 📖 可用的 API 方法

### 認證服務 (api.auth)

| 方法                         | 說明                         |
| ---------------------------- | ---------------------------- |
| `login(email, password)`     | 用戶登入                     |
| `register(userData)`         | 用戶註冊                     |
| `oauthLogin(provider, code)` | OAuth 登入                   |
| `logout()`                   | 登出                         |
| `refreshToken()`             | 刷新 token                   |
| `verifyToken()`              | 驗證 token                   |
| `initialize()`               | 初始化（載入已存儲的 token） |

### 影片服務 (api.videos)

| 方法                                     | 說明         |
| ---------------------------------------- | ------------ |
| `getVideos(params)`                      | 獲取影片列表 |
| `getVideoById(videoId)`                  | 獲取單一影片 |
| `uploadVideo(file, metadata)`            | 上傳影片     |
| `updateVideo(videoId, data)`             | 更新影片     |
| `deleteVideo(videoId)`                   | 刪除影片     |
| `getVideoTimeline(videoId)`              | 獲取時間軸   |
| `updateVideoTimeline(videoId, timeline)` | 更新時間軸   |
| `searchVideos(query, filters)`           | 搜尋影片     |
| `getVideoStats(videoId)`                 | 獲取統計資訊 |

### 用戶服務 (api.user)

| 方法                                       | 說明               |
| ------------------------------------------ | ------------------ |
| `getCurrentUser()`                         | 獲取當前用戶資訊   |
| `updateUser(data)`                         | 更新用戶資訊       |
| `changePassword(oldPassword, newPassword)` | 更改密碼           |
| `uploadAvatar(file)`                       | 上傳頭像           |
| `getPreferences()`                         | 獲取偏好設置       |
| `updatePreferences(preferences)`           | 更新偏好設置       |
| `getUserVideos(params)`                    | 獲取用戶的影片列表 |
| `getUserStats()`                           | 獲取用戶統計       |
| `deleteAccount(password)`                  | 刪除帳戶           |

## 🎨 設計特點

### 1. 模組化設計

- 每個服務獨立管理
- 易於維護和擴展

### 2. 統一的錯誤處理

- 所有方法使用 try-catch
- 統一的錯誤訊息格式

### 3. 自動 Token 管理

- 登入時自動保存
- 請求時自動附加
- 登出時自動清除

### 4. 靈活的配置

- 環境變數管理
- 支援多環境配置

### 5. 易於使用

- 簡潔的 API 介面
- 清晰的文檔說明

## 🔄 擴展 API

### 添加新服務

1. **創建服務檔案**

```javascript
// api/services/comments.js
const apiClient = require("../client");
const config = require("../config");

class CommentService {
  async getComments(videoId) {
    try {
      const response = await apiClient.get(`/api/videos/${videoId}/comments`);
      return response.data;
    } catch (error) {
      console.error("獲取評論失敗:", error.message);
      throw error;
    }
  }
}

module.exports = new CommentService();
```

2. **更新入口文件**

```javascript
// api/index.js
const commentService = require("./services/comments");

module.exports = {
  // ...
  comments: commentService,
};
```

3. **使用新服務**

```javascript
const api = require("./api");
const comments = await api.comments.getComments("video-id");
```

## ⚠️ 注意事項

### 1. 安全性

- ✅ `.env` 檔案已添加到 `.gitignore`
- ✅ 不要將敏感資訊寫在代碼中
- ✅ 使用 HTTPS 進行 API 通信

### 2. Token 管理

- ✅ Token 自動保存到 localStorage
- ✅ 應用啟動時自動載入 token
- ✅ Token 過期時需要重新登入

### 3. 錯誤處理

- ✅ 始終使用 try-catch 包裝 API 調用
- ✅ 處理 401 錯誤（未授權）
- ✅ 提供友好的錯誤訊息

### 4. 開發建議

- ✅ 在開發環境中啟用詳細日誌
- ✅ 使用開發者工具調試
- ✅ 定期更新依賴套件

## 📝 下一步

### 1. 配置環境變數

```bash
cp env.template .env
# 編輯 .env 填入您的配置
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 測試 API 連接

```javascript
const api = require("./api");
console.log("API URL:", api.config.api.baseUrl);
```

### 4. 整合到現有頁面

- 更新 `pages/scripts/login.js`
- 更新 `pages/scripts/dashboard.js`
- 更新 `pages/scripts/player.js`
- 更新 `pages/scripts/settings.js`

### 5. 測試功能

- 測試登入/登出
- 測試影片列表載入
- 測試影片播放
- 測試用戶設置

## 🆘 需要幫助？

### 查看文檔

- [API README](../api/README.md) - 詳細使用說明
- [API 快速入門](../API_QUICKSTART.md) - 5 分鐘快速上手
- [API 結構說明](../API_STRUCTURE.md) - 完整架構說明
- [API 集成指南](./API_INTEGRATION.md) - 集成範例

### 常見問題

1. **API_BASE_URL 沒有生效？**
   - 確認 .env 在項目根目錄
   - 確認 main.js 開頭有載入 dotenv
   - 重新啟動應用

2. **請求沒有 Token？**
   - 確認已登入
   - 檢查 localStorage 中的 token
   - 調用 `api.auth.initialize()`

3. **CORS 錯誤？**
   - 確認後端 API 的 CORS 設置
   - 檢查 API URL 是否正確

## ✨ 總結

您現在擁有一個完整的 API 模組架構：

✅ **清晰的檔案結構** - 模組化、易維護  
✅ **靈活的配置** - 通過 .env 管理  
✅ **完整的功能** - 認證、影片、用戶管理  
✅ **自動 Token 管理** - 無需手動處理  
✅ **詳細的文檔** - 多份指南和範例  
✅ **易於擴展** - 添加新服務很簡單

**開始使用您的 API 吧！** 🚀

```javascript
const api = require("./api");

// 登入
await api.auth.login("user@example.com", "password");

// 獲取資料
const videos = await api.videos.getVideos();
const user = await api.user.getCurrentUser();

console.log("API 已就緒！", { videos, user });
```

---

**創建日期**: 2025-11-03  
**API 網域**: https://local.cherub0526.qzz.io  
**狀態**: ✅ 已完成
