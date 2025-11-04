# Video Assistant - 完整項目結構

## 📁 項目目錄結構

```
video-assistant/
│
├── 📦 api/                              # API 模組目錄
│   ├── index.js                        # API 入口 - 統一導出所有服務
│   ├── config.js                       # 配置管理 - 從 .env 讀取設定
│   ├── client.js                       # HTTP 客戶端 - 處理所有請求
│   ├── README.md                       # API 詳細使用說明
│   └── services/                       # API 服務目錄
│       ├── auth.js                     # 🔐 認證服務（登入/登出/OAuth）
│       ├── videos.js                   # 🎥 影片服務（CRUD/搜尋/時間軸）
│       └── user.js                     # 👤 用戶服務（資訊/設置/統計）
│
├── 📂 docs/                             # 文檔目錄
│   ├── API_INTEGRATION.md              # API 集成指南（深入）
│   ├── API_SETUP_SUMMARY.md            # API 設置總結
│   ├── OAUTH_SETUP.md                  # OAuth 配置指南
│   ├── PROJECT_SUMMARY.md              # 項目概述
│   └── QUICKSTART.md                   # 快速開始指南
│
├── 📂 pages/                            # 前端頁面目錄
│   ├── index.html                      # 主儀表板頁面
│   ├── login.html                      # 登入頁面
│   ├── player.html                     # 影片播放器頁面
│   ├── settings.html                   # 設置頁面
│   │
│   ├── scripts/                        # JavaScript 腳本
│   │   ├── dashboard.js                # 儀表板邏輯
│   │   ├── login.js                    # 登入邏輯
│   │   ├── player.js                   # 播放器邏輯
│   │   └── settings.js                 # 設置邏輯
│   │
│   ├── styles/                         # CSS 樣式
│   │   ├── dashboard.css
│   │   ├── login.css
│   │   ├── player.css
│   │   └── settings.css
│   │
│   └── timelines/                      # 時間軸本地化檔案
│       ├── en.json                     # 英文
│       ├── ja.json                     # 日文
│       └── zh-TW.json                  # 繁體中文
│
├── 📂 out/                              # 編譯輸出目錄
│   ├── make/                           # 打包檔案
│   │   └── zip/
│   │       └── darwin/
│   │           └── arm64/
│   │               └── video-assistant-darwin-arm64-1.0.0.zip
│   └── video-assistant-darwin-arm64/   # macOS 應用程序
│
├── 📄 main.js                           # Electron 主進程入口
├── 📄 package.json                      # 項目依賴配置
├── 📄 package-lock.json                 # 依賴鎖定檔案
├── 📄 forge.config.js                   # Electron Forge 配置
├── 📄 config.example.js                 # OAuth 配置範例
│
├── 📄 .env                              # 環境變數（不提交到 Git）⚠️
├── 📄 env.template                      # 環境變數範本
├── 📄 .gitignore                        # Git 忽略規則
│
├── 📄 API_QUICKSTART.md                 # API 快速入門（5分鐘上手）
├── 📄 API_STRUCTURE.md                  # API 架構說明
├── 📄 PROJECT_STRUCTURE.md              # 本文件
├── 📄 FILE_STRUCTURE_UPDATE.md          # 檔案結構更新記錄
└── 📄 README.md                         # 項目說明
```

## 🎯 核心檔案說明

### API 模組 (api/)

| 檔案                 | 用途        | 主要功能                      |
| -------------------- | ----------- | ----------------------------- |
| `index.js`           | API 入口    | 統一導出所有服務，初始化認證  |
| `config.js`          | 配置管理    | 從 .env 讀取並管理所有配置    |
| `client.js`          | HTTP 客戶端 | 封裝所有 HTTP 請求邏輯        |
| `services/auth.js`   | 認證服務    | 登入、登出、OAuth、Token 管理 |
| `services/videos.js` | 影片服務    | 影片 CRUD、搜尋、時間軸管理   |
| `services/user.js`   | 用戶服務    | 用戶資訊、偏好設置、統計      |

### 前端頁面 (pages/)

| 頁面            | 用途       | 使用的 API                                                   |
| --------------- | ---------- | ------------------------------------------------------------ |
| `login.html`    | 登入介面   | `api.auth.login()`, `api.auth.oauthLogin()`                  |
| `index.html`    | 主儀表板   | `api.videos.getVideos()`, `api.videos.searchVideos()`        |
| `player.html`   | 影片播放器 | `api.videos.getVideoById()`, `api.videos.getVideoTimeline()` |
| `settings.html` | 用戶設置   | `api.user.getCurrentUser()`, `api.user.updateUser()`         |

### 配置檔案

| 檔案                | 用途                 | 提交到 Git |
| ------------------- | -------------------- | ---------- |
| `.env`              | 環境變數配置（實際） | ❌ 不提交  |
| `env.template`      | 環境變數範本         | ✅ 提交    |
| `config.example.js` | OAuth 配置範例       | ✅ 提交    |
| `.gitignore`        | Git 忽略規則         | ✅ 提交    |

### 文檔檔案

| 文檔                        | 內容             | 適合對象           |
| --------------------------- | ---------------- | ------------------ |
| `API_QUICKSTART.md`         | 5 分鐘快速上手   | 新手開發者         |
| `api/README.md`             | API 詳細使用說明 | 所有開發者         |
| `API_STRUCTURE.md`          | 完整架構說明     | 架構師、進階開發者 |
| `docs/API_INTEGRATION.md`   | 集成指南和範例   | 前端開發者         |
| `docs/API_SETUP_SUMMARY.md` | 設置總結         | 項目管理者         |

## 🔄 資料流程圖

### 1. 應用啟動流程

```
用戶啟動應用
    ↓
main.js 執行
    ↓
載入 .env 環境變數
    ↓
引入 API 模組 (api/index.js)
    ↓
API 自動初始化
    ├─ 載入配置 (config.js)
    ├─ 初始化 HTTP 客戶端 (client.js)
    └─ 初始化認證 (auth.js)
         └─ 從 localStorage 讀取 token
    ↓
檢查認證狀態
    ├─ Token 有效 → 顯示主視窗 (index.html)
    └─ Token 無效 → 顯示登入視窗 (login.html)
```

### 2. 登入流程

```
用戶輸入帳號密碼
    ↓
login.js 接收表單提交
    ↓
調用 api.auth.login(email, password)
    ↓
auth.js 處理登入請求
    ↓
client.js 發送 POST /api/auth/login
    ↓
API 伺服器 (https://local.cherub0526.qzz.io)
    ↓
返回 { token, user }
    ↓
auth.js 保存 token 到 localStorage
    ↓
auth.js 設置 token 到 HTTP 客戶端
    ↓
login.js 通知主進程登入成功
    ↓
main.js 切換到主視窗
```

### 3. API 請求流程

```
頁面需要資料（如影片列表）
    ↓
dashboard.js 調用 api.videos.getVideos()
    ↓
videos.js 處理請求
    ↓
client.js 發送 HTTP GET 請求
    ├─ 自動附加 Authorization: Bearer <token>
    ├─ 設置 Content-Type: application/json
    └─ 設置超時：30 秒
    ↓
API 伺服器處理請求
    ↓
返回 JSON 回應
    ↓
client.js 解析回應
    ├─ 成功 (200-299) → 返回資料
    └─ 失敗 (400+) → 拋出錯誤
    ↓
videos.js 返回資料或拋出錯誤
    ↓
dashboard.js 處理結果
    ├─ 成功 → 顯示資料
    └─ 失敗 → 顯示錯誤訊息
```

## 🔌 API 端點對照表

### API 基礎 URL

```
https://local.cherub0526.qzz.io
```

### 完整端點清單

#### 🔐 認證相關

| 方法 | 端點                 | JavaScript 調用                       |
| ---- | -------------------- | ------------------------------------- |
| POST | `/api/auth/login`    | `api.auth.login(email, password)`     |
| POST | `/api/auth/register` | `api.auth.register(userData)`         |
| POST | `/api/auth/oauth`    | `api.auth.oauthLogin(provider, code)` |
| POST | `/api/auth/logout`   | `api.auth.logout()`                   |
| POST | `/api/auth/refresh`  | `api.auth.refreshToken()`             |
| GET  | `/api/auth/verify`   | `api.auth.verifyToken()`              |

#### 🎥 影片相關

| 方法   | 端點                       | JavaScript 調用                                |
| ------ | -------------------------- | ---------------------------------------------- |
| GET    | `/api/videos`              | `api.videos.getVideos(params)`                 |
| GET    | `/api/videos/:id`          | `api.videos.getVideoById(id)`                  |
| POST   | `/api/videos`              | `api.videos.uploadVideo(file, metadata)`       |
| PUT    | `/api/videos/:id`          | `api.videos.updateVideo(id, data)`             |
| DELETE | `/api/videos/:id`          | `api.videos.deleteVideo(id)`                   |
| GET    | `/api/videos/:id/timeline` | `api.videos.getVideoTimeline(id)`              |
| PUT    | `/api/videos/:id/timeline` | `api.videos.updateVideoTimeline(id, timeline)` |
| GET    | `/api/videos/search`       | `api.videos.searchVideos(query, filters)`      |
| GET    | `/api/videos/:id/stats`    | `api.videos.getVideoStats(id)`                 |

#### 👤 用戶相關

| 方法   | 端點                        | JavaScript 調用                     |
| ------ | --------------------------- | ----------------------------------- |
| GET    | `/api/users/me`             | `api.user.getCurrentUser()`         |
| PUT    | `/api/users/me`             | `api.user.updateUser(data)`         |
| DELETE | `/api/users/me`             | `api.user.deleteAccount(password)`  |
| POST   | `/api/users/me/password`    | `api.user.changePassword(old, new)` |
| POST   | `/api/users/me/avatar`      | `api.user.uploadAvatar(file)`       |
| GET    | `/api/users/me/preferences` | `api.user.getPreferences()`         |
| PUT    | `/api/users/me/preferences` | `api.user.updatePreferences(prefs)` |
| GET    | `/api/users/me/videos`      | `api.user.getUserVideos(params)`    |
| GET    | `/api/users/me/stats`       | `api.user.getUserStats()`           |

## ⚙️ 環境變數配置

### 必填配置

```env
# API 基礎 URL（必填）
API_BASE_URL=https://local.cherub0526.qzz.io
```

### 完整配置

```env
# ========================================
# API 配置
# ========================================
API_BASE_URL=https://local.cherub0526.qzz.io
API_TIMEOUT=30000

# ========================================
# OAuth 配置（如需要）
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

## 📦 依賴套件

### 生產依賴 (dependencies)

```json
{
  "electron-squirrel-startup": "^1.0.1",
  "dotenv": "^16.4.5",
  "axios": "^1.7.2"
}
```

| 套件                        | 版本    | 用途                |
| --------------------------- | ------- | ------------------- |
| `electron-squirrel-startup` | ^1.0.1  | Electron 啟動處理   |
| `dotenv`                    | ^16.4.5 | 環境變數管理        |
| `axios`                     | ^1.7.2  | HTTP 客戶端（可選） |

### 開發依賴 (devDependencies)

```json
{
  "@electron-forge/cli": "^7.10.2",
  "@electron-forge/maker-zip": "^7.10.2",
  "electron": "^38.3.0"
}
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變數

```bash
# 複製範本
cp env.template .env

# 編輯配置
nano .env
```

填入：

```env
API_BASE_URL=https://local.cherub0526.qzz.io
```

### 3. 啟動應用

```bash
npm start
```

### 4. 開始使用 API

```javascript
const api = require("./api");

// 登入
await api.auth.login("user@example.com", "password");

// 獲取影片
const videos = await api.videos.getVideos();
```

## 📖 使用範例

### 在登入頁面

```javascript
// pages/scripts/login.js
const api = require("../../api");

async function handleLogin(email, password) {
  try {
    const result = await api.auth.login(email, password);
    console.log("登入成功:", result);
  } catch (error) {
    console.error("登入失敗:", error.message);
  }
}
```

### 在儀表板頁面

```javascript
// pages/scripts/dashboard.js
const api = require("../../api");

async function loadVideos() {
  try {
    const result = await api.videos.getVideos({ page: 1, limit: 20 });
    displayVideos(result.videos);
  } catch (error) {
    console.error("載入失敗:", error);
  }
}
```

### 在播放器頁面

```javascript
// pages/scripts/player.js
const api = require("../../api");

async function loadVideo(videoId) {
  try {
    const video = await api.videos.getVideoById(videoId);
    const timeline = await api.videos.getVideoTimeline(videoId);

    displayVideo(video);
    displayTimeline(timeline);
  } catch (error) {
    console.error("載入失敗:", error);
  }
}
```

## 🔐 安全性說明

### 保護敏感資訊

✅ **正確做法**：

```javascript
// 使用環境變數
const apiUrl = process.env.API_BASE_URL;
const clientId = process.env.GOOGLE_CLIENT_ID;
```

❌ **錯誤做法**：

```javascript
// 不要寫死在代碼中
const apiUrl = "https://local.cherub0526.qzz.io";
const clientId = "abc123xyz";
```

### Token 安全

- ✅ Token 儲存在 localStorage
- ✅ Token 只在有效期內使用
- ✅ 登出時清除 Token
- ✅ HTTPS 加密傳輸

### 文件安全

- ✅ `.env` 已加入 `.gitignore`
- ✅ `config.js` 已加入 `.gitignore`
- ✅ 不提交敏感資訊到版本控制

## 📚 文檔索引

### 快速入門

- [API 快速入門](./API_QUICKSTART.md) - 5 分鐘快速上手

### 詳細說明

- [API 使用說明](./api/README.md) - 完整的 API 使用文檔
- [API 架構說明](./API_STRUCTURE.md) - 深入的架構分析
- [API 集成指南](./docs/API_INTEGRATION.md) - 集成範例和最佳實踐

### 配置指南

- [API 設置總結](./docs/API_SETUP_SUMMARY.md) - 設置步驟總結
- [OAuth 設置](./docs/OAUTH_SETUP.md) - OAuth 配置教程

### 項目資訊

- [項目概述](./docs/PROJECT_SUMMARY.md) - 項目整體介紹
- [快速開始](./docs/QUICKSTART.md) - 項目快速開始

## 🎯 開發工作流程

### 日常開發

```bash
# 1. 啟動開發環境
npm start

# 2. 修改代碼
# 編輯 pages/scripts/*.js 或 api/services/*.js

# 3. 重新啟動查看效果
# Ctrl+C 停止，然後 npm start
```

### 添加新 API 服務

```bash
# 1. 創建服務檔案
touch api/services/新服務.js

# 2. 實作服務邏輯
# 編輯 api/services/新服務.js

# 3. 在 api/index.js 中導出
# 添加: const 新服務 = require('./services/新服務');

# 4. 使用新服務
# api.新服務.方法名()
```

### 打包應用

```bash
# 打包為可分發的應用程序
npm run package

# 創建安裝程序
npm run make
```

## 🔧 故障排除

### 常見問題

1. **API_BASE_URL 沒有生效**
   - 確認 `.env` 在項目根目錄
   - 重新啟動應用程序

2. **無法連接 API**
   - 檢查網路連接
   - 確認 API URL 正確
   - 檢查 API 伺服器是否運行

3. **Token 無效**
   - 重新登入
   - 檢查 localStorage 中的 token
   - 確認 token 未過期

4. **CORS 錯誤**
   - 檢查後端 CORS 設置
   - 確認 API 允許來自 Electron 的請求

## 📊 項目統計

### 檔案數量

- API 模組：7 個檔案
- 前端頁面：4 個 HTML + 4 個 JS + 4 個 CSS
- 文檔：7 個 Markdown 檔案
- 配置：5 個配置檔案

### 代碼行數（約）

- API 模組：~1000 行
- 文檔：~3000 行
- 配置：~100 行

### API 端點

- 認證：6 個端點
- 影片：9 個端點
- 用戶：9 個端點
- **總計：24 個端點**

## ✨ 特點總結

✅ **完整的 API 架構** - 認證、影片、用戶服務  
✅ **模組化設計** - 易於維護和擴展  
✅ **靈活的配置** - 通過 .env 管理  
✅ **自動 Token 管理** - 無需手動處理  
✅ **詳細的文檔** - 多份指南和範例  
✅ **安全性考慮** - 保護敏感資訊  
✅ **錯誤處理** - 統一的錯誤處理機制  
✅ **易於使用** - 簡潔的 API 介面

## 🎉 開始開發

現在您已經了解了完整的項目結構，可以開始開發了！

```javascript
const api = require("./api");

// 您的第一個 API 調用
const videos = await api.videos.getVideos();
console.log("API 已就緒！", videos);
```

---

**項目**: Video Assistant  
**版本**: 1.0.0  
**API 網域**: https://local.cherub0526.qzz.io  
**更新日期**: 2025-11-03  
**狀態**: ✅ 完成並可使用
