# 快速開始指南

## 立即測試應用程式

### 1. 啟動應用程式

```bash
npm start
```

### 2. 測試登入功能

應用程式啟動後會顯示登入頁面，您可以：

#### 測試註冊功能

1. 點擊「註冊」標籤
2. 填寫表單：
   - 姓名：輸入任意名稱
   - 電子郵件：test@example.com
   - 密碼：test1234（至少 8 個字元）
   - 確認密碼：test1234
3. 勾選「同意服務條款」
4. 點擊「註冊」按鈕
5. 註冊成功後會自動切換到登入頁面

#### 測試登入功能

1. 電子郵件：test@example.com
2. 密碼：test1234
3. 可選擇勾選「記住我」
4. 點擊「登入」按鈕
5. 登入成功後會進入主應用程式

#### 測試社群登入（需要設定）

- 點擊「使用 Google 繼續」或「使用 Facebook 繼續」
- **注意**：社群登入需要先設定 OAuth 憑證才能使用
- 詳細設定請參閱 [OAUTH_SETUP.md](./OAUTH_SETUP.md)

## 目前功能狀態

### ✅ 已實作功能

- [x] 登入/註冊頁面 UI
- [x] 表單驗證（前端）
- [x] 標籤切換動畫
- [x] 密碼確認檢查
- [x] 記住我功能 UI
- [x] 忘記密碼連結
- [x] OAuth 流程框架
- [x] 主應用程式歡迎頁面

### 🔧 需要完善的功能

- [ ] 後端 API 整合
- [ ] 實際的使用者資料儲存
- [ ] OAuth 憑證設定
- [ ] 密碼加密
- [ ] Session 管理
- [ ] 密碼重設功能實作

## 無需後端的測試

目前的實作允許您在**沒有後端伺服器**的情況下測試所有 UI 功能：

1. 所有表單都會進行前端驗證
2. 提交表單後會顯示成功訊息
3. 登入成功後會進入主應用程式頁面
4. 所有動畫和互動都可以正常測試

**這意味著您可以立即體驗完整的使用者介面流程！**

## 檔案結構說明

```
video-assistant/
│
├── login.html              # 登入/註冊頁面
│   └── 包含完整的表單 UI 和社群登入按鈕
│
├── styles/
│   └── login.css          # 登入頁面的所有樣式
│       └── 響應式設計、動畫效果
│
├── scripts/
│   └── login.js           # 登入頁面邏輯
│       ├── 表單驗證
│       ├── 標籤切換
│       └── IPC 通訊
│
├── index.html             # 主應用程式頁面
│   └── 登入成功後顯示的歡迎頁面
│
├── main.js                # Electron 主程序
│   ├── 視窗管理
│   ├── IPC 事件處理
│   └── OAuth 流程處理
│
└── config.example.js      # OAuth 設定範例
```

## 自訂您的應用程式

### 修改品牌顏色

編輯 `styles/login.css`：

```css
/* 主要漸層色 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 修改為您的品牌色 */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### 修改應用程式名稱

1. **登入頁面**：編輯 `login.html` 第 11 行

```html
<h1>您的應用程式名稱</h1>
```

2. **主頁面**：編輯 `index.html` 第 145 行

```html
<h1>您的應用程式名稱</h1>
```

3. **視窗標題**：編輯對應的 `<title>` 標籤

### 新增表單欄位

在 `login.html` 中新增輸入欄位：

```html
<div class="input-group">
  <label for="phone">電話號碼</label>
  <input type="tel" id="phone" placeholder="請輸入電話號碼" />
</div>
```

在 `scripts/login.js` 中獲取值：

```javascript
const phone = document.getElementById("phone").value;
```

## 整合後端 API

### 準備您的 API 端點

您需要以下 API 端點：

```
POST /api/auth/register
- 參數：{ name, email, password }
- 回傳：{ success, message, token }

POST /api/auth/login
- 參數：{ email, password }
- 回傳：{ success, message, token, user }

POST /api/auth/oauth
- 參數：{ provider, code }
- 回傳：{ success, message, token, user }
```

### 修改 login.js

在 `scripts/login.js` 中，將模擬 API 呼叫替換為實際請求：

```javascript
// 登入 API
async function loginUser(email, password) {
  const response = await fetch("https://your-api.com/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "登入失敗");
  }

  return data;
}

// 在表單提交處使用
loginFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const result = await loginUser(email, password);

    // 儲存 token
    localStorage.setItem("token", result.token);

    // 進入主頁面
    ipcRenderer.send("login-success", result.user);
  } catch (error) {
    showMessage("登入失敗：" + error.message, "error");
  }
});
```

## 常見問題

### Q: 為什麼點擊社群登入按鈕沒有反應？

A: 社群登入需要先設定 OAuth 憑證。參閱 [OAUTH_SETUP.md](./OAUTH_SETUP.md) 進行設定。

### Q: 如何儲存使用者的登入狀態？

A: 有幾種方式：

1. 使用 localStorage 儲存 token
2. 使用 Electron 的 store 套件
3. 使用後端 session

範例：

```javascript
// 儲存
localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));

// 讀取
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
```

### Q: 如何實作「記住我」功能？

A: 在登入成功時檢查 checkbox：

```javascript
const rememberMe = document.getElementById("remember-me").checked;

if (rememberMe) {
  // 使用 localStorage 長期儲存
  localStorage.setItem("rememberMe", "true");
  localStorage.setItem("token", token);
} else {
  // 使用 sessionStorage 僅在此次會話儲存
  sessionStorage.setItem("token", token);
}
```

### Q: 如何添加載入動畫？

A: 在 `login.css` 中新增：

```css
.loading {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

在 `login.js` 中使用：

```javascript
function showLoading() {
  const btn = document.querySelector(".btn-primary");
  btn.disabled = true;
  btn.innerHTML = '<div class="loading"></div>';
}

function hideLoading() {
  const btn = document.querySelector(".btn-primary");
  btn.disabled = false;
  btn.innerHTML = "登入";
}
```

## 下一步

1. ✅ 測試所有 UI 功能
2. 📝 設計您的後端 API
3. 🔐 設定 OAuth（如需要）
4. 🔗 整合後端 API
5. 🎨 自訂應用程式外觀
6. 🚀 打包並發布應用程式

## 需要幫助？

- 查看 [README.md](./README.md) 了解完整文件
- 查看 [OAUTH_SETUP.md](./OAUTH_SETUP.md) 了解 OAuth 設定
- 檢查控制台的錯誤訊息
- 開啟 DevTools：在 `main.js` 中取消註解 `mainWindow.webContents.openDevTools()`

祝您開發順利！🎉
