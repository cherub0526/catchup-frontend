const { app, BrowserWindow, ipcMain, shell } = require("electron");

let mainWindow;

// 建立登入視窗
function createLoginWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 780,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("pages/login.html");

  // 開發時開啟 DevTools（可選）
  // mainWindow.webContents.openDevTools();
}

// 建立主視窗
function createMainWindow() {
  if (mainWindow) {
    mainWindow.close();
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("pages/index.html");
}

// 處理登入成功
ipcMain.on("login-success", () => {
  createMainWindow();
});

// 處理 OAuth 登入
ipcMain.on("oauth-login", async (event, { provider }) => {
  try {
    let authUrl;

    if (provider === "google") {
      // Google OAuth URL
      // 注意：這裡需要替換成您的實際 Client ID
      const clientId = "YOUR_GOOGLE_CLIENT_ID";
      const redirectUri = "http://localhost/callback";
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    } else if (provider === "facebook") {
      // Facebook OAuth URL
      // 注意：這裡需要替換成您的實際 App ID
      const appId = "YOUR_FACEBOOK_APP_ID";
      const redirectUri = "http://localhost/callback";
      authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=email,public_profile`;
    }

    // 建立 OAuth 視窗
    const authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    authWindow.loadURL(authUrl);

    // 監聽 URL 變化
    authWindow.webContents.on("will-redirect", (event, url) => {
      handleCallback(url, authWindow, event);
    });

    authWindow.webContents.on("did-get-redirect-request", (event, oldUrl, newUrl) => {
      handleCallback(newUrl, authWindow, event);
    });

    // 處理回調
    function handleCallback(url, window, event) {
      const urlObj = new URL(url);

      if (urlObj.hostname === "localhost" && urlObj.pathname === "/callback") {
        const code = urlObj.searchParams.get("code");
        const error = urlObj.searchParams.get("error");

        if (code) {
          // 成功獲取授權碼
          console.log("授權碼:", code);

          // 這裡應該將授權碼發送到您的後端伺服器進行驗證
          // 並取得用戶資訊

          mainWindow.webContents.send("oauth-result", {
            success: true,
            provider,
            code,
          });

          window.close();
        } else if (error) {
          // 授權失敗
          mainWindow.webContents.send("oauth-result", {
            success: false,
            error: error,
          });

          window.close();
        }
      }
    }
  } catch (error) {
    console.error("OAuth 錯誤:", error);
    event.reply("oauth-result", {
      success: false,
      error: error.message,
    });
  }
});

app.on("ready", () => {
  createLoginWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLoginWindow();
  }
});
