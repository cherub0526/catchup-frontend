const { app, BrowserWindow, ipcMain } = require('electron')
const { join } = require('path')

// 開發環境檢測
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

// 創建主視窗
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // 開發環境載入 Vite 開發伺服器，生產環境載入打包後的檔案
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

// 處理登入成功（如果需要從登入視窗切換到主視窗）
ipcMain.on('login-success', () => {
  // 在 Vue Router 中處理路由跳轉，這裡不需要特別處理
  console.log('Login success')
})

// 處理 OAuth 登入
ipcMain.on('oauth-login', async (event, { provider }) => {
  try {
    let authUrl

    if (provider === 'google') {
      // Google OAuth URL
      const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
      const redirectUri = 'http://localhost/callback'
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`
    } else if (provider === 'facebook') {
      // Facebook OAuth URL
      const appId = process.env.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID'
      const redirectUri = 'http://localhost/callback'
      authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=email,public_profile`
    }

    // 創建 OAuth 視窗
    const authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    authWindow.loadURL(authUrl)

    // 監聽 URL 變化
    authWindow.webContents.on('will-redirect', (event, url) => {
      handleCallback(url, authWindow, event)
    })

    authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      handleCallback(newUrl, authWindow, event)
    })

    // 處理回調
    function handleCallback(url, window, event) {
      try {
        const urlObj = new URL(url)

        if (urlObj.hostname === 'localhost' && urlObj.pathname === '/callback') {
          const code = urlObj.searchParams.get('code')
          const error = urlObj.searchParams.get('error')

          if (code) {
            // 成功獲取授權碼
            console.log('授權碼:', code)

            mainWindow.webContents.send('oauth-result', {
              success: true,
              provider,
              code,
            })

            window.close()
          } else if (error) {
            // 授權失敗
            mainWindow.webContents.send('oauth-result', {
              success: false,
              error: error,
            })

            window.close()
          }
        }
      } catch (err) {
        console.error('處理回調時發生錯誤:', err)
      }
    }
  } catch (error) {
    console.error('OAuth 錯誤:', error)
    event.reply('oauth-result', {
      success: false,
      error: error.message,
    })
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

