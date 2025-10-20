// OAuth 配置範例
// 複製此檔案為 config.js 並填入您的實際資訊

module.exports = {
  google: {
    clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
    redirectUri: "http://localhost/callback",
  },
  facebook: {
    appId: "YOUR_FACEBOOK_APP_ID",
    appSecret: "YOUR_FACEBOOK_APP_SECRET",
    redirectUri: "http://localhost/callback",
  },
};
