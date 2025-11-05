# Video Assistant - Vue 3 版本

這是一個使用 Vue 3 + Electron 開發的影音助手應用程式。

## 技術棧

- **前端框架**: Vue 3 (Composition API)
- **路由**: Vue Router 4
- **狀態管理**: Pinia
- **建構工具**: Vite
- **桌面框架**: Electron
- **HTTP 客戶端**: Axios

## 專案結構

```
video-assistant/
├── electron/                 # Electron 主進程檔案
│   ├── main.js              # Electron 主進程入口
│   └── preload.js           # Preload 腳本
├── src/                     # Vue 3 原始碼
│   ├── api/                 # API 客戶端
│   ├── assets/              # 靜態資源
│   │   └── styles/          # 全局樣式
│   ├── components/          # Vue 組件
│   ├── composables/         # 組合式函數
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia stores
│   │   ├── auth.js          # 認證狀態
│   │   └── subscriptions.js # 訂閱狀態
│   ├── utils/               # 工具函數
│   ├── views/               # 頁面組件
│   │   ├── Login.vue        # 登入頁面
│   │   ├── Dashboard.vue    # 主控台
│   │   ├── Player.vue       # 播放器
│   │   └── Settings.vue     # 設定頁面
│   ├── App.vue              # 根組件
│   └── main.js              # Vue 應用入口
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置
└── package.json             # 專案配置

## 開發指令

### 安裝依賴
```bash
npm install
```

### 開發模式（同時啟動 Vite 和 Electron）
```bash
npm start
```

### 僅啟動 Vite 開發伺服器
```bash
npm run dev
```

### 僅啟動 Electron
```bash
npm run electron:dev
```

### 建構生產版本
```bash
npm run build
```

### 打包 Electron 應用
```bash
npm run electron:build
```

## 主要功能

### 1. 認證系統
- 傳統登入/註冊
- OAuth 社群登入（Google、Facebook）
- 忘記密碼功能

### 2. 多平台支援
- YouTube
- Spotify
- Firstory
- Apple Podcasts
- SoundCloud
- Vimeo

### 3. 訂閱管理
- 新增/刪除訂閱
- 多平台切換
- 本地資料持久化

### 4. 內容瀏覽
- 影片/音訊卡片展示
- 時間篩選
- 播放器整合

## 狀態管理

### Auth Store (stores/auth.js)
管理使用者認證狀態：
- `isAuthenticated`: 登入狀態
- `user`: 使用者資訊
- `token`: 認證令牌
- `login()`: 登入方法
- `register()`: 註冊方法
- `logout()`: 登出方法
- `oauthLogin()`: OAuth 登入

### Subscriptions Store (stores/subscriptions.js)
管理訂閱和影片資料：
- `currentSource`: 當前選中的平台
- `subscriptionsData`: 所有平台的訂閱資料
- `videosData`: 所有平台的影片資料
- `switchSource()`: 切換平台
- `addSubscription()`: 新增訂閱
- `deleteSubscription()`: 刪除訂閱

## 路由配置

- `/login` - 登入頁面
- `/dashboard` - 主控台（需要認證）
- `/player` - 播放器（需要認證）
- `/settings` - 設定頁面（需要認證）

路由守衛會自動處理認證檢查。

## API 整合

API 客戶端位於 `src/api/index.js`，支援：
- 自動添加認證令牌
- 錯誤處理
- 響應攔截

## 樣式系統

使用 CSS 變數進行主題管理，主要顏色：
- Primary: `#667eea`
- Secondary: `#764ba2`
- Success: `#10b981`
- Error: `#ef4444`

## 環境變數

創建 `.env` 檔案（參考 `.env.example`）：

```
API_URL=http://localhost:3000/api
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
```

## 注意事項

1. **開發模式**: 確保 Vite 開發伺服器（port 5173）先啟動
2. **生產建構**: 需要先執行 `npm run build` 建構前端資源
3. **OAuth 配置**: 需要在對應平台申請 OAuth 應用並設定 Client ID

## 遷移說明

從原本的原生 HTML/JS 架構遷移到 Vue 3：

### 主要變更
1. **組件化**: 所有頁面轉換為 Vue 單檔案組件
2. **狀態管理**: 使用 Pinia 替代 localStorage 直接操作
3. **路由**: 使用 Vue Router 處理頁面導航
4. **反應式**: 使用 Composition API 的 ref/reactive
5. **模組化**: ES Modules 替代全局腳本

### 數據持久化
仍然使用 localStorage，但通過 Pinia stores 封裝：
- 登入時自動保存 token
- 訂閱資料變更時自動保存
- 應用啟動時自動載入

## 開發建議

1. **組件開發**: 優先使用 Composition API
2. **樣式**: 使用 scoped CSS 避免樣式衝突
3. **狀態**: 全局狀態使用 Pinia，局部狀態使用 ref/reactive
4. **類型**: 考慮引入 TypeScript 增強類型安全

## 問題排查

### Electron 無法啟動
- 檢查 Vite 開發伺服器是否在 5173 端口運行
- 確認 `electron/main.js` 路徑正確

### API 請求失敗
- 檢查 `.env` 中的 API_URL 配置
- 確認後端服務正常運行
- 查看瀏覽器 Console 的錯誤訊息

### 路由不工作
- 確認使用 `createWebHashHistory`（Electron 環境）
- 檢查路由守衛邏輯

## License

MIT

