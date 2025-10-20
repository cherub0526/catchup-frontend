# Video Assistant

一個使用 Electron 打造的影片助理應用程式，提供完整的使用者認證系統。

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
cd video-assistant
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
video-assistant/
├── main.js                 # Electron 主程序
├── pages/                  # 所有頁面檔案
│   ├── login.html         # 登入/註冊頁面
│   ├── index.html         # 主應用程式頁面
│   ├── styles/
│   │   └── login.css      # 登入頁面樣式
│   └── scripts/
│       └── login.js       # 登入頁面邏輯
├── config.example.js      # OAuth 設定範例
├── README.md              # 專案說明文件
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
- **前端**：HTML5, CSS3, JavaScript (Vanilla)
- **打包工具**：Electron Forge

### 主要檔案說明

#### main.js

- Electron 主程序
- 處理視窗建立
- 處理 IPC 通訊
- 實作 OAuth 流程

#### login.html

- 登入/註冊頁面 HTML 結構
- 包含表單和社群登入按鈕

#### styles/login.css

- 登入頁面的所有樣式
- 響應式設計
- 現代化 UI 元素

#### scripts/login.js

- 處理表單提交
- 表單驗證
- 與主程序通訊
- OAuth 流程觸發

### 自訂設計

您可以輕鬆自訂應用程式的外觀：

1. **顏色主題**：編輯 `styles/login.css` 中的漸層色和主色調
2. **Logo**：替換 `.logo-section` 中的標題
3. **表單欄位**：在 HTML 中新增或移除欄位

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
