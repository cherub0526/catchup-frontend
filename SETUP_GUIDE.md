# Video Assistant - 安裝與設置指南

## 🎯 API 網域配置

您的 API 已配置為：

```
https://local.cherub0526.qzz.io
```

## ⚡ 快速安裝（3 步驟）

### 步驟 1: 安裝依賴套件

```bash
npm install
```

這將安裝：

- `dotenv` - 環境變數管理
- `axios` - HTTP 客戶端
- 其他必要的 Electron 依賴

### 步驟 2: 創建環境變數檔案

```bash
# 複製環境變數範本
cp env.template .env
```

然後編輯 `.env` 檔案（必填項目）：

```env
API_BASE_URL=https://local.cherub0526.qzz.io
```

### 步驟 3: 啟動應用

```bash
npm start
```

## ✅ 完成！

您現在可以在應用程序中使用 API 了：

```javascript
const api = require("./api");

// 登入
await api.auth.login("user@example.com", "password");

// 獲取影片列表
const videos = await api.videos.getVideos();

// 獲取用戶資訊
const user = await api.user.getCurrentUser();
```

## 📝 詳細配置（可選）

如果需要配置 OAuth 或其他功能，編輯 `.env`：

```env
# API 配置
API_BASE_URL=https://local.cherub0526.qzz.io
API_TIMEOUT=30000

# Google OAuth（可選）
GOOGLE_CLIENT_ID=你的_CLIENT_ID
GOOGLE_CLIENT_SECRET=你的_CLIENT_SECRET

# Facebook OAuth（可選）
FACEBOOK_APP_ID=你的_APP_ID
FACEBOOK_APP_SECRET=你的_APP_SECRET

# 應用配置
NODE_ENV=development
LOG_LEVEL=debug
```

## 🔍 驗證安裝

### 檢查 API 配置

在應用程序中執行：

```javascript
const api = require("./api");
console.log("API URL:", api.config.api.baseUrl);
// 應該輸出: https://local.cherub0526.qzz.io
```

### 測試 API 連接

```javascript
const api = require("./api");

// 測試登入（使用您的測試帳號）
try {
  const result = await api.auth.login("test@example.com", "password");
  console.log("✅ API 連接成功!", result);
} catch (error) {
  console.error("❌ API 連接失敗:", error.message);
}
```

## 📚 可用的 API 功能

### 🔐 認證

```javascript
api.auth.login(email, password); // 登入
api.auth.logout(); // 登出
api.auth.oauthLogin(provider, code); // OAuth 登入
api.auth.verifyToken(); // 驗證 Token
```

### 🎥 影片管理

```javascript
api.videos.getVideos(params); // 獲取影片列表
api.videos.getVideoById(id); // 獲取影片詳情
api.videos.uploadVideo(file, metadata); // 上傳影片
api.videos.updateVideo(id, data); // 更新影片
api.videos.deleteVideo(id); // 刪除影片
api.videos.searchVideos(query); // 搜尋影片
api.videos.getVideoTimeline(id); // 獲取時間軸
```

### 👤 用戶管理

```javascript
api.user.getCurrentUser()                 // 獲取當前用戶
api.user.updateUser(data)                 // 更新用戶資訊
api.user.changePassword(old, new)         // 更改密碼
api.user.getPreferences()                 // 獲取偏好設置
api.user.updatePreferences(prefs)         // 更新偏好設置
```

## 🗂️ 檔案結構

```
video-assistant/
├── api/                    # ← API 模組（核心）
│   ├── index.js           # API 入口
│   ├── config.js          # 配置管理
│   ├── client.js          # HTTP 客戶端
│   └── services/          # API 服務
│       ├── auth.js        # 認證
│       ├── videos.js      # 影片
│       └── user.js        # 用戶
│
├── .env                   # ← 您的配置（創建此檔案）
├── env.template           # 配置範本
├── main.js                # Electron 主進程
└── pages/                 # 前端頁面
```

## 📖 文檔資源

- [API 快速入門](./API_QUICKSTART.md) - 5 分鐘快速上手
- [API 使用說明](./api/README.md) - 詳細的 API 文檔
- [完整項目結構](./PROJECT_STRUCTURE.md) - 項目架構說明
- [API 集成指南](./docs/API_INTEGRATION.md) - 集成範例

## ⚠️ 重要提醒

1. **不要提交 .env 到 Git**
   - `.env` 已自動加入 `.gitignore`
   - 只提交 `env.template` 作為範本

2. **保護 API 密鑰**
   - 不要將密鑰寫在代碼中
   - 使用環境變數管理敏感資訊

3. **Token 管理**
   - Token 自動保存到 localStorage
   - 登出時自動清除
   - 應用啟動時自動載入

## 🐛 故障排除

### 問題：API_BASE_URL 沒有生效

**解決方法**：

1. 確認 `.env` 檔案在項目根目錄
2. 確認檔案名稱正確（是 `.env` 不是 `env`）
3. 重新啟動應用程序

### 問題：找不到 dotenv 模組

**解決方法**：

```bash
npm install dotenv
```

### 問題：無法連接到 API

**解決方法**：

1. 檢查網路連接
2. 確認 API URL 正確
3. 確認 API 伺服器正在運行
4. 檢查防火牆設置

### 問題：Token 無效或過期

**解決方法**：

```javascript
// 重新登入
await api.auth.logout();
await api.auth.login(email, password);
```

## 🎓 下一步

1. **測試 API 連接**
   - 使用測試帳號登入
   - 測試獲取影片列表

2. **整合到頁面**
   - 在 `pages/scripts/login.js` 中使用 `api.auth`
   - 在 `pages/scripts/dashboard.js` 中使用 `api.videos`

3. **自定義配置**
   - 根據需要調整環境變數
   - 配置 OAuth（如需要）

4. **開始開發**
   - 查看 [API 集成指南](./docs/API_INTEGRATION.md)
   - 參考範例代碼

## 💬 需要幫助？

- 查看 [API 快速入門](./API_QUICKSTART.md)
- 閱讀 [完整文檔](./api/README.md)
- 檢查 [故障排除](#-故障排除) 章節

## ✅ 檢查清單

在開始使用之前，請確認：

- [ ] 已執行 `npm install`
- [ ] 已創建 `.env` 檔案
- [ ] 已設置 `API_BASE_URL` 環境變數
- [ ] 應用程序可以正常啟動
- [ ] 可以連接到 API

---

**全部完成！開始使用您的 API 吧！** 🚀

```javascript
// 您的第一個 API 調用
const api = require("./api");
const videos = await api.videos.getVideos();
console.log("Success!", videos);
```
