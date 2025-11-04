# API 檔案結構說明

## 概述

本文檔描述 Video Assistant 應用程序的 API 模組結構和組織方式。

## 目錄結構

```
video-assistant/
│
├── api/                              # API 模組根目錄
│   │
│   ├── index.js                     # API 模組入口文件
│   │                                # 統一導出所有服務和配置
│   │
│   ├── config.js                    # 配置管理模組
│   │                                # 從環境變數讀取配置
│   │                                # 管理 API 基礎 URL、超時設置等
│   │
│   ├── client.js                    # HTTP 客戶端
│   │                                # 封裝所有 HTTP 請求邏輯
│   │                                # 處理請求/回應、錯誤、超時等
│   │
│   ├── services/                    # API 服務目錄
│   │   │
│   │   ├── auth.js                 # 認證服務
│   │   │                           # 登入、登出、註冊
│   │   │                           # OAuth 認證
│   │   │                           # Token 管理
│   │   │
│   │   ├── videos.js               # 影片服務
│   │   │                           # 影片 CRUD 操作
│   │   │                           # 影片搜尋
│   │   │                           # 時間軸管理
│   │   │                           # 影片上傳
│   │   │
│   │   └── user.js                 # 用戶服務
│   │                               # 用戶資訊管理
│   │                               # 偏好設置
│   │                               # 頭像上傳
│   │
│   └── README.md                    # API 使用說明文檔
│
├── .env                             # 環境變數配置（不提交到 Git）
│                                    # 包含 API URL、OAuth 密鑰等敏感資訊
│
├── env.template                     # 環境變數範本
│                                    # 提供配置範例和說明
│
├── .gitignore                       # Git 忽略檔案
│                                    # 確保 .env 不被提交
│
├── main.js                          # Electron 主進程
│                                    # 載入環境變數
│                                    # 初始化 API 模組
│
├── package.json                     # 項目依賴配置
│                                    # 包含 dotenv、axios 等依賴
│
├── docs/                            # 文檔目錄
│   ├── API_INTEGRATION.md          # API 集成指南
│   ├── OAUTH_SETUP.md              # OAuth 設置說明
│   ├── PROJECT_SUMMARY.md          # 項目概述
│   └── QUICKSTART.md               # 快速開始指南
│
└── pages/                           # 前端頁面
    ├── index.html                   # 主頁面
    ├── login.html                   # 登入頁面
    ├── player.html                  # 播放器頁面
    ├── settings.html                # 設置頁面
    │
    └── scripts/                     # 前端腳本
        ├── dashboard.js             # 儀表板邏輯（使用 API）
        ├── login.js                 # 登入邏輯（使用 API）
        ├── player.js                # 播放器邏輯（使用 API）
        └── settings.js              # 設置邏輯（使用 API）
```

## 核心檔案說明

### 1. api/index.js

**用途**：API 模組的入口點

```javascript
module.exports = {
  apiClient, // HTTP 客戶端實例
  config, // 配置物件
  auth, // 認證服務
  videos, // 影片服務
  user, // 用戶服務
};
```

**使用方式**：

```javascript
const api = require("./api");
api.auth.login(email, password);
api.videos.getVideos();
```

### 2. api/config.js

**用途**：集中管理所有配置

**配置項目**：

- API 基礎 URL
- 請求超時設置
- OAuth 配置
- JWT 配置
- API 端點路徑

**數據來源**：從 `.env` 檔案讀取

### 3. api/client.js

**用途**：HTTP 請求的核心實現

**功能**：

- 發送 HTTP 請求（GET, POST, PUT, DELETE, PATCH）
- 自動附加認證 token
- 處理請求超時
- 錯誤處理
- 回應解析

**方法**：

```javascript
apiClient.get(endpoint, params);
apiClient.post(endpoint, data);
apiClient.put(endpoint, data);
apiClient.delete(endpoint);
apiClient.setToken(token);
```

### 4. api/services/auth.js

**用途**：處理所有認證相關操作

**主要方法**：

- `login(email, password)` - 用戶登入
- `register(userData)` - 用戶註冊
- `oauthLogin(provider, code)` - OAuth 登入
- `logout()` - 登出
- `refreshToken()` - 刷新 token
- `verifyToken()` - 驗證 token
- `initialize()` - 初始化（載入已存儲的 token）

**Token 管理**：

- 自動將 token 存儲到 localStorage
- 登入時自動設置 token 到 HTTP 客戶端
- 登出時清除 token

### 5. api/services/videos.js

**用途**：處理所有影片相關操作

**主要方法**：

- `getVideos(params)` - 獲取影片列表
- `getVideoById(videoId)` - 獲取單一影片
- `uploadVideo(file, metadata)` - 上傳影片
- `updateVideo(videoId, data)` - 更新影片
- `deleteVideo(videoId)` - 刪除影片
- `getVideoTimeline(videoId)` - 獲取時間軸
- `updateVideoTimeline(videoId, timeline)` - 更新時間軸
- `searchVideos(query, filters)` - 搜尋影片
- `getVideoStats(videoId)` - 獲取統計資訊

### 6. api/services/user.js

**用途**：處理所有用戶相關操作

**主要方法**：

- `getCurrentUser()` - 獲取當前用戶資訊
- `updateUser(data)` - 更新用戶資訊
- `changePassword(oldPassword, newPassword)` - 更改密碼
- `uploadAvatar(file)` - 上傳頭像
- `getPreferences()` - 獲取偏好設置
- `updatePreferences(preferences)` - 更新偏好設置
- `getUserVideos(params)` - 獲取用戶的影片
- `getUserStats()` - 獲取用戶統計
- `deleteAccount(password)` - 刪除帳戶

## 環境變數配置

### .env 檔案

**位置**：項目根目錄

**內容範例**：

```env
# API 配置
API_BASE_URL=https://local.cherub0526.qzz.io
API_TIMEOUT=30000

# OAuth 配置
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# 應用配置
NODE_ENV=development
LOG_LEVEL=debug

# JWT 配置
JWT_SECRET=your_secret_key
```

**重要**：

- ❌ 不要提交 `.env` 到版本控制
- ✅ 將 `.env` 添加到 `.gitignore`
- ✅ 提供 `env.template` 作為範本

### env.template 檔案

**用途**：提供環境變數配置範本和說明

**特點**：

- 包含所有必需的環境變數
- 提供詳細的註釋和說明
- 可以安全地提交到版本控制

## API 端點結構

### 基礎 URL

```
https://local.cherub0526.qzz.io
```

### 端點設計

#### 認證相關

```
POST   /api/auth/login          # 登入
POST   /api/auth/register       # 註冊
POST   /api/auth/oauth          # OAuth 登入
POST   /api/auth/logout         # 登出
POST   /api/auth/refresh        # 刷新 token
GET    /api/auth/verify         # 驗證 token
```

#### 影片相關

```
GET    /api/videos              # 獲取影片列表
POST   /api/videos              # 創建影片
GET    /api/videos/:id          # 獲取單一影片
PUT    /api/videos/:id          # 更新影片
DELETE /api/videos/:id          # 刪除影片
GET    /api/videos/:id/timeline # 獲取時間軸
PUT    /api/videos/:id/timeline # 更新時間軸
GET    /api/videos/search       # 搜尋影片
GET    /api/videos/:id/stats    # 獲取統計
```

#### 用戶相關

```
GET    /api/users/me            # 獲取當前用戶
PUT    /api/users/me            # 更新用戶資訊
DELETE /api/users/me            # 刪除帳戶
POST   /api/users/me/password   # 更改密碼
POST   /api/users/me/avatar     # 上傳頭像
GET    /api/users/me/preferences # 獲取偏好設置
PUT    /api/users/me/preferences # 更新偏好設置
GET    /api/users/me/videos     # 獲取用戶影片
GET    /api/users/me/stats      # 獲取用戶統計
```

#### 上傳相關

```
POST   /api/upload              # 上傳檔案
```

## 資料流程

### 1. 認證流程

```
用戶輸入登入資訊
    ↓
login.js 調用 api.auth.login()
    ↓
auth.js 調用 apiClient.post('/api/auth/login')
    ↓
client.js 發送 HTTP POST 請求到伺服器
    ↓
收到回應（包含 token）
    ↓
auth.js 保存 token 到 localStorage
    ↓
auth.js 設置 token 到 apiClient
    ↓
返回用戶資訊
    ↓
login.js 通知主進程登入成功
    ↓
main.js 切換到主視窗
```

### 2. 獲取資料流程

```
頁面載入
    ↓
dashboard.js 調用 api.videos.getVideos()
    ↓
videos.js 調用 apiClient.get('/api/videos')
    ↓
client.js 自動附加 Authorization header
    ↓
client.js 發送 HTTP GET 請求
    ↓
收到回應（影片列表）
    ↓
解析 JSON 資料
    ↓
返回資料到 dashboard.js
    ↓
dashboard.js 顯示影片列表
```

### 3. 錯誤處理流程

```
API 請求失敗
    ↓
client.js 捕獲錯誤
    ↓
檢查錯誤類型
    ↓
如果是 401（未授權）
    ├─ 嘗試刷新 token
    ├─ 重試請求
    └─ 如果刷新失敗，清除 token
    ↓
拋出錯誤
    ↓
服務層捕獲錯誤
    ↓
記錄錯誤日誌
    ↓
拋出到應用層
    ↓
應用層顯示錯誤訊息給用戶
```

## 設計原則

### 1. 關注點分離

- **config.js**：只負責配置管理
- **client.js**：只負責 HTTP 通信
- **services/**：只負責業務邏輯

### 2. 單一職責

每個服務模組只處理特定領域的操作：

- `auth.js` → 認證
- `videos.js` → 影片
- `user.js` → 用戶

### 3. DRY（Don't Repeat Yourself）

- 共用的 HTTP 邏輯在 `client.js` 中實現
- 配置集中在 `config.js` 中管理
- 避免重複代碼

### 4. 易於擴展

添加新服務只需：

1. 在 `services/` 創建新檔案
2. 實作服務類
3. 在 `index.js` 中導出

範例：

```javascript
// api/services/comments.js
const apiClient = require("../client");

class CommentService {
  async getComments(videoId) {
    const response = await apiClient.get(`/api/videos/${videoId}/comments`);
    return response.data;
  }
}

module.exports = new CommentService();
```

```javascript
// api/index.js
const commentService = require("./services/comments");

module.exports = {
  // ...
  comments: commentService,
};
```

### 5. 錯誤處理

所有方法使用 try-catch 處理錯誤並記錄日誌

### 6. 安全性

- 敏感資訊存儲在 `.env` 中
- Token 自動附加到請求
- HTTPS 通信

## 依賴關係

```
main.js
  └── require('./api')
        └── api/index.js
              ├── api/config.js
              │     └── dotenv (讀取 .env)
              ├── api/client.js
              │     └── https/http (Node.js 內建)
              └── api/services/
                    ├── auth.js
                    ├── videos.js
                    └── user.js
                          └── api/client.js
```

## 擴展建議

### 添加新的 API 服務

1. **創建服務檔案**

```javascript
// api/services/新服務.js
const apiClient = require("../client");
const config = require("../config");

class 新Service {
  async 方法名(參數) {
    try {
      const response = await apiClient.get("/endpoint");
      return response.data;
    } catch (error) {
      console.error("錯誤:", error.message);
      throw error;
    }
  }
}

module.exports = new 新Service();
```

2. **更新入口檔案**

```javascript
// api/index.js
const 新服務 = require("./services/新服務");

module.exports = {
  // ...
  新服務,
};
```

3. **添加配置（如需要）**

```javascript
// api/config.js
endpoints: {
  // ...
  新端點: '/api/新路徑',
},
```

### 添加新的環境變數

1. **更新 env.template**

```env
# 新功能配置
NEW_FEATURE_API_KEY=your_api_key
NEW_FEATURE_ENABLED=true
```

2. **更新 api/config.js**

```javascript
newFeature: {
  apiKey: process.env.NEW_FEATURE_API_KEY || '',
  enabled: process.env.NEW_FEATURE_ENABLED === 'true',
},
```

## 最佳實踐

### 1. 始終使用 try-catch

```javascript
async function getData() {
  try {
    return await api.videos.getVideos();
  } catch (error) {
    console.error("Error:", error);
    // 處理錯誤
  }
}
```

### 2. 檢查認證狀態

```javascript
if (await api.auth.verifyToken()) {
  // Token 有效，繼續操作
} else {
  // Token 無效，返回登入頁面
}
```

### 3. 使用環境變數

```javascript
// ❌ 不好
const apiUrl = "https://local.cherub0526.qzz.io";

// ✅ 好
const apiUrl = process.env.API_BASE_URL;
```

### 4. 保護敏感資訊

```javascript
// ❌ 不要將敏感資訊寫在代碼中
const apiKey = "sk-1234567890";

// ✅ 使用環境變數
const apiKey = process.env.API_KEY;
```

## 相關文檔

- [API README](../api/README.md) - API 使用說明
- [API Integration Guide](../docs/API_INTEGRATION.md) - 集成指南
- [OAuth Setup](../docs/OAUTH_SETUP.md) - OAuth 配置
- [Quick Start](../docs/QUICKSTART.md) - 快速開始

## 總結

這個 API 架構提供了：

✅ **清晰的結構** - 模組化設計，易於理解和維護  
✅ **靈活的配置** - 通過 .env 檔案管理所有配置  
✅ **統一的介面** - 所有 API 調用使用一致的方式  
✅ **完善的錯誤處理** - 統一的錯誤處理機制  
✅ **易於擴展** - 添加新服務非常簡單  
✅ **安全性** - 敏感資訊妥善保護  
✅ **可維護性** - 代碼組織清晰，職責明確

通過遵循這個結構，您可以輕鬆地維護和擴展應用程序的 API 功能。
