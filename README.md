# CatchUp

**輕鬆跟上節奏，不再錯過精彩**

一個使用 Electron 打造的智能助理應用程式，自動化總結訂閱頻道內容，提供完整的使用者認證系統和訂閱管理功能。

## 功能特色

### 使用者認證系統

- ✅ 傳統帳號密碼登入/註冊
- ✅ Google 社群登入
- ✅ Facebook 社群登入
- ✅ 記住我功能
- ✅ 忘記密碼功能
- ✅ 現代化 UI 設計

## 安裝說明

### 前置需求

- Node.js (v14 或更高版本)
- npm 或 yarn

### 安裝步驟

1. 複製專案

```bash
git clone <repository-url>
cd catchup
```

2. 安裝相依套件

```bash
npm install
```

3. 設定 OAuth 憑證（選用）

如果您要使用社群登入功能：

```bash
cp config.example.js config.js
```

然後編輯 `config.js` 並填入您的 OAuth 憑證。

詳細設定說明請參閱 [OAUTH_SETUP.md](./OAUTH_SETUP.md)

## 執行應用程式

### 開發模式

```bash
npm start
```

### 打包應用程式

```bash
npm run package
```

### 建立安裝檔

```bash
npm run make
```

## 專案結構

```
catchup/
├── electron/              # Electron 主程序
│   ├── main.js           # 主程序入口
│   └── preload.js        # 預載入腳本
├── src/                  # Vue 3 應用程式
│   ├── views/           # 頁面組件
│   │   ├── Login.vue    # 登入/註冊頁面
│   │   ├── Dashboard.vue # 主儀表板
│   │   ├── Player.vue   # 影片播放器
│   │   ├── Settings.vue # 設定頁面
│   │   └── Subscription.vue # 訂閱管理
│   ├── components/      # 共用組件
│   ├── stores/          # Pinia 狀態管理
│   ├── config/          # 應用配置（統一管理名稱、slogan 等）
│   └── api/             # API 服務
├── config.example.js    # OAuth 設定範例
├── README.md            # 專案說明文件
└── package.json
```

## 使用說明

### 登入/註冊

1. 啟動應用程式後會顯示登入畫面
2. 您可以選擇：
   - 使用帳號密碼註冊新帳戶
   - 使用已有帳號登入
   - 使用 Google 帳號登入（需設定）
   - 使用 Facebook 帳號登入（需設定）

### 帳號密碼註冊

1. 點擊「註冊」標籤
2. 填寫以下資訊：
   - 姓名
   - 電子郵件
   - 密碼（至少 8 個字元）
   - 確認密碼
3. 勾選同意服務條款
4. 點擊「註冊」按鈕

### 社群登入

1. 點擊「使用 Google 繼續」或「使用 Facebook 繼續」
2. 在彈出的視窗中完成授權
3. 授權成功後自動登入應用程式

## 開發說明

### 技術棧

- **框架**：Electron
- **前端**：Vue 3 (Composition API)
- **狀態管理**：Pinia
- **路由**：Vue Router
- **建置工具**：Vite
- **打包工具**：Electron Forge

### 主要檔案說明

#### electron/main.js

- Electron 主程序
- 處理視窗建立
- 處理 IPC 通訊
- 實作 OAuth 流程
- 配置應用程式標題和描述

#### src/config/app.js

**統一的應用配置檔案** - 這是整個專案中最重要的配置文件：

- 集中管理應用名稱、Slogan、描述等
- 修改此檔案後，所有引用的組件和頁面都會自動更新
- 無需在多個地方手動修改應用名稱

```javascript
export const APP_CONFIG = {
  name: 'CatchUp',  // 應用名稱
  slogan: {
    zh: '輕鬆跟上節奏，不再錯過精彩',
    en: 'Stay caught up, without the catch.'
  },
  description: '自動化總結訂閱頻道內容的智能助理',
  // ...其他配置
}
```

#### src/views/

- **Login.vue** - 登入/註冊頁面，包含社群登入
- **Dashboard.vue** - 主儀表板，顯示訂閱內容
- **Player.vue** - 影片播放器頁面
- **Settings.vue** - 使用者設定頁面
- **Subscription.vue** - 訂閱方案管理

#### src/stores/

使用 Pinia 進行狀態管理：
- **auth.js** - 使用者認證狀態
- **media.js** - 媒體內容管理
- **plans.js** - 訂閱方案管理
- **subscriptions.js** - 頻道訂閱管理

### 自訂應用配置

**統一管理應用名稱和 Slogan：**

1. 編輯 `src/config/app.js` 檔案
2. 修改 `APP_CONFIG` 物件中的設定：
   ```javascript
   export const APP_CONFIG = {
     name: '您的應用名稱',  // 修改應用名稱
     slogan: {
       zh: '您的中文 Slogan',
       en: 'Your English Slogan'
     },
     // ...
   }
   ```
3. 儲存後，所有使用該配置的組件會自動更新

**自訂樣式：**

1. **顏色主題**：編輯 `src/assets/styles/variables.css` 中的 CSS 變數
2. **組件樣式**：每個 Vue 組件都有 scoped 樣式區塊
3. **全域樣式**：編輯 `src/assets/styles/main.css`

### 與後端整合

目前的實作包含前端 OAuth 流程。要完整實作社群登入，您需要：

1. 建立後端 API 伺服器
2. 實作以下端點：
   - `POST /auth/login` - 處理帳號密碼登入
   - `POST /auth/register` - 處理註冊
   - `POST /auth/oauth/callback` - 處理 OAuth 回調
   - `POST /auth/reset-password` - 處理密碼重設

3. 更新 `scripts/login.js` 中的 API 呼叫

範例整合：

```javascript
// 在 login.js 中
async function loginUser(email, password) {
  const response = await fetch("https://your-api.com/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("登入失敗");
  }

  const data = await response.json();
  return data;
}
```

## 安全性考量

1. **憑證管理**
   - 不要將 `config.js` 提交到版本控制
   - 使用環境變數儲存敏感資訊

2. **密碼安全**
   - 前端實作密碼強度檢查
   - 後端必須加密儲存密碼（bcrypt）

3. **OAuth 安全**
   - 僅在後端處理客戶端密鑰
   - 實作 CSRF 保護
   - 驗證重新導向 URI

4. **通訊安全**
   - 生產環境使用 HTTPS
   - 實作適當的 CORS 政策

## 故障排除

### 應用程式無法啟動

- 確認已安裝所有相依套件：`npm install`
- 檢查 Node.js 版本是否符合需求

### 社群登入無法運作

- 確認已正確設定 OAuth 憑證
- 檢查重新導向 URI 是否正確設定
- 參閱 [OAUTH_SETUP.md](./OAUTH_SETUP.md)

### 樣式顯示異常

- 清除快取並重新啟動
- 檢查檔案路徑是否正確

## 授權

MIT License

## 貢獻

歡迎提交 Pull Request 或回報問題。

## 聯絡方式

如有問題或建議，請開啟 Issue。
