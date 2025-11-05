# 環境變數設定指南

## 📝 設定步驟

### 1. 創建 `.env` 檔案

在專案根目錄創建 `.env` 檔案：

```bash
# 在專案根目錄執行
touch .env
```

### 2. 設定環境變數

在 `.env` 檔案中加入以下內容：

```env
# API Configuration
# ⚠️ 注意：Vite 環境變數必須以 VITE_ 開頭才能在前端使用
VITE_API_URL=http://localhost:3000/api

# OAuth Configuration
# 這些變數在 Electron 主進程中使用，不需要 VITE_ 前綴
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
```

## 🔑 重要說明

### Vite 環境變數規則

**在前端代碼中使用的環境變數必須：**
1. ✅ 以 `VITE_` 開頭
2. ✅ 使用 `import.meta.env.VITE_變數名` 存取

**範例：**
```javascript
// ✅ 正確
const apiUrl = import.meta.env.VITE_API_URL

// ❌ 錯誤 - 無法在 Vite 中使用
const apiUrl = process.env.API_URL
```

### Electron 主進程環境變數

**在 Electron 主進程中（electron/main.js）：**
- 使用 `process.env.變數名` 存取
- 不需要 `VITE_` 前綴

## 📋 完整的環境變數模板

```env
# ===========================================
# API 設定（前端使用）
# ===========================================
# 開發環境 API
VITE_API_URL=http://localhost:3000/api

# 生產環境 API（部署時使用）
# VITE_API_URL=https://api.yourdomain.com

# ===========================================
# OAuth 設定（Electron 主進程使用）
# ===========================================
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id_here

# ===========================================
# 其他設定
# ===========================================
# 開發模式
NODE_ENV=development
```

## 🌍 不同環境的設定

### 開發環境 (.env.development)

創建 `.env.development` 檔案：

```env
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### 生產環境 (.env.production)

創建 `.env.production` 檔案：

```env
VITE_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

Vite 會根據執行的命令自動載入對應的環境變數文件：
- `npm run dev` → 載入 `.env.development`
- `npm run build` → 載入 `.env.production`

## 💡 使用範例

### 在 Vue 組件中使用

```vue
<script setup>
// 取得 API URL
const apiUrl = import.meta.env.VITE_API_URL
console.log('API URL:', apiUrl)

// 檢查環境
const isDev = import.meta.env.DEV  // 開發環境為 true
const isProd = import.meta.env.PROD  // 生產環境為 true
</script>
```

### 在 API 客戶端中使用

```javascript
// src/api/index.js
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const client = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
})
```

### 在 Electron 主進程中使用

```javascript
// electron/main.js
const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}...`
```

## 🔒 安全注意事項

### ⚠️ 不要提交敏感資訊

`.env` 檔案已加入 `.gitignore`，不會被提交到 Git。

### ✅ 使用 .env.example 作為模板

提供 `.env.example` 檔案作為範例，不包含真實的敏感資訊：

```env
# .env.example
VITE_API_URL=http://localhost:3000/api
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
```

### 🔑 取得 OAuth 憑證

#### Google OAuth
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立專案
3. 啟用 Google+ API
4. 建立 OAuth 2.0 憑證
5. 複製 Client ID 到 `.env`

#### Facebook OAuth
1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 建立應用程式
3. 前往設定 → 基本資料
4. 複製應用程式編號到 `.env`

## 🔄 重新載入環境變數

修改 `.env` 檔案後：

1. **開發環境**：重新啟動開發伺服器
   ```bash
   # 停止當前伺服器 (Ctrl+C)
   # 重新啟動
   npm start
   ```

2. **生產環境**：重新建構
   ```bash
   npm run build
   ```

## 🐛 常見問題

### Q: 為什麼我的環境變數無法存取？

**A**: 檢查以下幾點：
1. ✅ 環境變數是否以 `VITE_` 開頭？
2. ✅ 是否使用 `import.meta.env.VITE_變數名`？
3. ✅ 是否重新啟動了開發伺服器？
4. ✅ `.env` 檔案是否在專案根目錄？

### Q: 如何在不同的 API 環境間切換？

**A**: 使用不同的環境變數文件：

```bash
# 開發環境
npm run dev  # 自動使用 .env.development

# 生產環境
npm run build  # 自動使用 .env.production

# 自定義環境
vite --mode staging  # 使用 .env.staging
```

### Q: 環境變數為 undefined？

**A**: 
1. 確認變數名稱正確
2. 確認已重新啟動開發伺服器
3. 檢查 `.env` 檔案語法是否正確（不要有多餘的空格或引號）

```env
# ✅ 正確
VITE_API_URL=http://localhost:3000/api

# ❌ 錯誤
VITE_API_URL = "http://localhost:3000/api"
```

## 📚 延伸閱讀

- [Vite 環境變數文檔](https://vitejs.dev/guide/env-and-mode.html)
- [dotenv 文檔](https://github.com/motdotla/dotenv)

## ✅ 檢查清單

設定完成後，確認：

- [ ] `.env` 檔案已創建
- [ ] `VITE_API_URL` 已設定
- [ ] OAuth 憑證已配置（如需要）
- [ ] 開發伺服器已重新啟動
- [ ] API 可以正常連接

## 🎉 完成！

環境變數設定完成後，您的應用就可以正確連接到 API 了。

如果遇到問題，請檢查瀏覽器 Console 的輸出訊息。

