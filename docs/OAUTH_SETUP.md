# OAuth 社群登入設定指南

## 概述

此應用程式支援以下社群登入方式：

- Google 登入
- Facebook 登入

## Google OAuth 設定

### 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API

### 2. 設定 OAuth 同意畫面

1. 在側邊欄選擇「API 和服務」>「OAuth 同意畫面」
2. 選擇使用者類型（內部或外部）
3. 填寫應用程式名稱、使用者支援電子郵件等資訊
4. 儲存並繼續

### 3. 建立 OAuth 2.0 用戶端 ID

1. 在側邊欄選擇「API 和服務」>「憑證」
2. 點擊「建立憑證」>「OAuth 用戶端 ID」
3. 選擇應用程式類型：「桌面應用程式」
4. 設定授權重新導向 URI：
   - `http://localhost/callback`
5. 建立後會獲得：
   - 用戶端 ID
   - 用戶端密鑰

### 4. 將憑證加入應用程式

複製 `config.example.js` 為 `config.js` 並填入您的憑證：

```javascript
google: {
  clientId: '您的用戶端ID.apps.googleusercontent.com',
  clientSecret: '您的用戶端密鑰',
  redirectUri: 'http://localhost/callback',
}
```

## Facebook OAuth 設定

### 1. 建立 Facebook 應用程式

1. 前往 [Facebook 開發者平台](https://developers.facebook.com/)
2. 點擊「我的應用程式」>「建立應用程式」
3. 選擇應用程式類型（通常選擇「消費者」）
4. 填寫應用程式名稱和聯絡電子郵件

### 2. 設定 Facebook 登入

1. 在應用程式儀表板中，新增「Facebook 登入」產品
2. 選擇「網路」平台
3. 設定網站 URL（可暫時填寫 `http://localhost`）

### 3. 設定 OAuth 重新導向 URI

1. 前往「Facebook 登入」>「設定」
2. 在「有效的 OAuth 重新導向 URI」中新增：
   - `http://localhost/callback`
3. 儲存變更

### 4. 取得應用程式憑證

1. 在應用程式儀表板的「設定」>「基本資料」中找到：
   - 應用程式編號（App ID）
   - 應用程式密鑰（App Secret）

### 5. 將憑證加入應用程式

在 `config.js` 中填入您的憑證：

```javascript
facebook: {
  appId: '您的應用程式編號',
  appSecret: '您的應用程式密鑰',
  redirectUri: 'http://localhost/callback',
}
```

## 更新 main.js

修改 `main.js` 中的 OAuth 設定部分：

```javascript
// 在檔案開頭加入
const config = require("./config");

// 然後更新 OAuth URL
if (provider === "google") {
  authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.google.clientId}&redirect_uri=${config.google.redirectUri}&response_type=code&scope=email profile`;
} else if (provider === "facebook") {
  authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${config.facebook.appId}&redirect_uri=${config.facebook.redirectUri}&response_type=code&scope=email,public_profile`;
}
```

## 後端整合

OAuth 流程通常需要後端伺服器來：

1. 接收授權碼
2. 使用授權碼和客戶端密鑰交換存取權杖
3. 使用存取權杖獲取使用者資訊
4. 建立或更新使用者帳戶
5. 發放應用程式的登入 token

### 建議的後端架構

```
前端（Electron）
    ↓ 開始 OAuth 流程
OAuth 提供者（Google/Facebook）
    ↓ 返回授權碼
前端接收授權碼
    ↓ 發送授權碼到後端
後端伺服器
    ↓ 交換存取權杖
    ↓ 取得使用者資訊
    ↓ 建立/更新使用者
    ↓ 發放應用程式 token
前端接收 token 並完成登入
```

## 安全性注意事項

1. **永遠不要在前端程式碼中暴露客戶端密鑰**
2. 將 `config.js` 加入 `.gitignore`
3. 在生產環境中使用環境變數
4. 實作適當的 CSRF 保護
5. 使用 HTTPS（生產環境）
6. 驗證所有來自 OAuth 提供者的回應

## 測試

1. 啟動應用程式：`npm start`
2. 點擊「使用 Google 繼續」或「使用 Facebook 繼續」
3. 完成 OAuth 授權流程
4. 確認應用程式正確接收授權碼

## 故障排除

### 常見問題

**問題：OAuth 視窗開啟後顯示錯誤**

- 檢查 Client ID/App ID 是否正確
- 確認重新導向 URI 設定正確
- 檢查應用程式是否已啟用相關 API

**問題：授權成功但無法取得使用者資訊**

- 確認您已請求適當的權限範圍（scope）
- 檢查存取權杖是否有效
- 確認後端正確處理權杖交換

**問題：開發環境中無法使用 localhost**

- 某些 OAuth 提供者需要完整的網域名稱
- 考慮使用 `127.0.0.1` 或設定本地網域

## 相關資源

- [Google OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [Facebook 登入文件](https://developers.facebook.com/docs/facebook-login)
- [Electron OAuth 最佳實踐](https://www.electronjs.org/docs/latest/tutorial/security)
