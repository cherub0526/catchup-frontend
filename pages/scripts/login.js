const { ipcRenderer } = require("electron");

// DOM 元素
const tabButtons = document.querySelectorAll(".tab-btn");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const forgotPasswordForm = document.getElementById("forgot-password-form");
const loginFormElement = document.getElementById("loginForm");
const registerFormElement = document.getElementById("registerForm");
const forgotPasswordFormElement = document.getElementById("forgotPasswordForm");
const googleLoginBtn = document.getElementById("google-login");
const facebookLoginBtn = document.getElementById("facebook-login");
const googleRegisterBtn = document.getElementById("google-register");
const facebookRegisterBtn = document.getElementById("facebook-register");
const forgotPasswordLink = document.querySelector(".forgot-password");
const backToLoginBtn = document.getElementById("back-to-login");

// 標籤切換功能
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    // 更新按鈕狀態
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // 切換表單
    if (tab === "login") {
      loginForm.classList.add("active");
      registerForm.classList.remove("active");
      forgotPasswordForm.classList.remove("active");
    } else {
      registerForm.classList.add("active");
      loginForm.classList.remove("active");
      forgotPasswordForm.classList.remove("active");
    }
  });
});

// 登入表單提交
loginFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const rememberMe = document.getElementById("remember-me").checked;

  // 清除之前的錯誤訊息
  removeMessage();

  try {
    // 這裡應該呼叫後端 API 進行登入驗證
    console.log("登入資訊:", { email, password, rememberMe });

    // 模擬 API 呼叫
    await simulateApiCall();

    // 登入成功
    showMessage("登入成功！", "success");

    // 延遲後進入主畫面
    setTimeout(() => {
      ipcRenderer.send("login-success");
    }, 1000);
  } catch (error) {
    showMessage("登入失敗：" + error.message, "error");
  }
});

// 註冊表單提交
registerFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm-password").value;
  const agreeTerms = document.getElementById("agree-terms").checked;

  // 清除之前的錯誤訊息
  removeMessage();

  // 驗證密碼
  if (password !== confirmPassword) {
    showMessage("密碼與確認密碼不符", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("密碼長度至少需要 8 個字元", "error");
    return;
  }

  if (!agreeTerms) {
    showMessage("請同意服務條款和隱私政策", "error");
    return;
  }

  try {
    // 這裡應該呼叫後端 API 進行註冊
    console.log("註冊資訊:", { name, email, password });

    // 模擬 API 呼叫
    await simulateApiCall();

    // 註冊成功
    showMessage("註冊成功！請登入", "success");

    // 切換到登入頁面
    setTimeout(() => {
      document.querySelector('.tab-btn[data-tab="login"]').click();
      document.getElementById("login-email").value = email;
    }, 1500);
  } catch (error) {
    showMessage("註冊失敗：" + error.message, "error");
  }
});

// Google 登入
googleLoginBtn.addEventListener("click", async () => {
  try {
    console.log("開始 Google 登入流程");
    removeMessage();

    // 通知主程序開始 OAuth 流程
    ipcRenderer.send("oauth-login", { provider: "google" });
  } catch (error) {
    showMessage("Google 登入失敗：" + error.message, "error");
  }
});

// Facebook 登入
facebookLoginBtn.addEventListener("click", async () => {
  try {
    console.log("開始 Facebook 登入流程");
    removeMessage();

    // 通知主程序開始 OAuth 流程
    ipcRenderer.send("oauth-login", { provider: "facebook" });
  } catch (error) {
    showMessage("Facebook 登入失敗：" + error.message, "error");
  }
});

// Google 註冊（使用相同的 OAuth 流程）
googleRegisterBtn.addEventListener("click", async () => {
  try {
    console.log("開始 Google 註冊流程");
    removeMessage();

    // 通知主程序開始 OAuth 流程
    ipcRenderer.send("oauth-login", { provider: "google" });
  } catch (error) {
    showMessage("Google 註冊失敗：" + error.message, "error");
  }
});

// Facebook 註冊（使用相同的 OAuth 流程）
facebookRegisterBtn.addEventListener("click", async () => {
  try {
    console.log("開始 Facebook 註冊流程");
    removeMessage();

    // 通知主程序開始 OAuth 流程
    ipcRenderer.send("oauth-login", { provider: "facebook" });
  } catch (error) {
    showMessage("Facebook 註冊失敗：" + error.message, "error");
  }
});

// 監聽來自主程序的 OAuth 結果
ipcRenderer.on("oauth-result", (event, result) => {
  if (result.success) {
    showMessage("登入成功！", "success");
    setTimeout(() => {
      ipcRenderer.send("login-success");
    }, 1000);
  } else {
    showMessage("社群登入失敗：" + (result.error || "未知錯誤"), "error");
  }
});

// 顯示訊息
function showMessage(message, type) {
  removeMessage();

  const messageDiv = document.createElement("div");
  messageDiv.className = type === "error" ? "error-message show" : "success-message show";
  messageDiv.textContent = message;

  const activeForm = document.querySelector(".form-container.active");
  activeForm.insertBefore(messageDiv, activeForm.firstChild);
}

// 移除訊息
function removeMessage() {
  const messages = document.querySelectorAll(".error-message, .success-message");
  messages.forEach((msg) => msg.remove());
}

// 模擬 API 呼叫（僅供示範）
function simulateApiCall() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

// 忘記密碼連結
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();

  // 隱藏所有表單
  loginForm.classList.remove("active");
  registerForm.classList.remove("active");
  forgotPasswordForm.classList.add("active");

  // 移除標籤按鈕的 active 狀態
  tabButtons.forEach((btn) => btn.classList.remove("active"));

  // 清除訊息
  removeMessage();
});

// 返回登入按鈕
backToLoginBtn.addEventListener("click", () => {
  // 顯示登入表單
  forgotPasswordForm.classList.remove("active");
  loginForm.classList.add("active");

  // 恢復登入標籤的 active 狀態
  document.querySelector('.tab-btn[data-tab="login"]').classList.add("active");

  // 清除訊息和表單
  removeMessage();
  forgotPasswordFormElement.reset();
});

// 忘記密碼表單提交
forgotPasswordFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgot-email").value;

  // 清除之前的錯誤訊息
  removeMessage();

  // 驗證電子郵件格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("請輸入有效的電子郵件地址", "error");
    return;
  }

  try {
    // 這裡應該呼叫後端 API 發送重設密碼郵件
    console.log("發送重設密碼連結到:", email);

    // 模擬 API 呼叫
    await simulateApiCall();

    // 成功訊息
    showMessage("重設密碼連結已發送到您的信箱，請檢查您的電子郵件", "success");

    // 清空表單
    setTimeout(() => {
      forgotPasswordFormElement.reset();
    }, 2000);
  } catch (error) {
    showMessage("發送失敗：" + error.message, "error");
  }
});
