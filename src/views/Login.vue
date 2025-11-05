<template>
  <div class="login-page">
    <div class="container">
      <div class="login-box">
        <!-- Logo 區域 -->
        <div class="logo-section">
          <h1>Video Assistant</h1>
        </div>

        <!-- 標籤切換 -->
        <div class="tab-container">
          <button class="tab-btn" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">登入</button>
          <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
            註冊
          </button>
        </div>

        <!-- 登入表單 -->
        <div v-show="activeTab === 'login'" class="form-container active">
          <div v-if="message" :class="messageClass">{{ message }}</div>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="login-account">帳號</label>
              <input type="text" id="login-account" v-model="loginForm.account" placeholder="請輸入您的帳號" required />
            </div>
            <div class="input-group">
              <label for="login-password">密碼</label>
              <input
                type="password"
                id="login-password"
                v-model="loginForm.password"
                placeholder="請輸入您的密碼"
                required />
            </div>
            <div class="options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="loginForm.rememberMe" />
                <span>記住我</span>
              </label>
              <a href="#" class="forgot-password" @click.prevent="showForgotPassword">忘記密碼？</a>
            </div>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? "登入中..." : "登入" }}
            </button>
          </form>

          <!-- 分隔線 -->
          <div class="divider">
            <span>或</span>
          </div>

          <!-- 社群登入按鈕 -->
          <div class="social-login">
            <button class="btn-social btn-google" @click="handleOAuthLogin('google')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              使用 Google 繼續
            </button>
            <button class="btn-social btn-facebook" @click="handleOAuthLogin('facebook')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              使用 Facebook 繼續
            </button>
          </div>
        </div>

        <!-- 註冊表單 -->
        <div v-show="activeTab === 'register'" class="form-container active">
          <div v-if="message" :class="messageClass">{{ message }}</div>

          <form @submit.prevent="handleRegister">
            <div class="input-group">
              <label for="register-account">帳號</label>
              <input
                type="text"
                id="register-account"
                v-model="registerForm.account"
                placeholder="請輸入您的帳號"
                required />
            </div>
            <div class="input-group">
              <label for="register-email">電子郵件</label>
              <input
                type="email"
                id="register-email"
                v-model="registerForm.email"
                placeholder="請輸入您的電子郵件"
                required />
            </div>
            <div class="input-group">
              <label for="register-password">密碼</label>
              <input
                type="password"
                id="register-password"
                v-model="registerForm.password"
                placeholder="請輸入密碼（至少 8 個字元）"
                required
                minlength="8" />
            </div>
            <div class="input-group">
              <label for="register-confirm-password">確認密碼</label>
              <input
                type="password"
                id="register-confirm-password"
                v-model="registerForm.confirmPassword"
                placeholder="請再次輸入密碼"
                required />
            </div>
            <div class="options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="registerForm.agreeTerms" required />
                <span>我同意<a href="#" class="link">服務條款</a>和<a href="#" class="link">隱私政策</a></span>
              </label>
            </div>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? "註冊中..." : "註冊" }}
            </button>
          </form>

          <!-- 分隔線 -->
          <div class="divider">
            <span>或</span>
          </div>

          <!-- 社群登入按鈕 -->
          <div class="social-login">
            <button class="btn-social btn-google" @click="handleOAuthLogin('google')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              使用 Google 繼續
            </button>
            <button class="btn-social btn-facebook" @click="handleOAuthLogin('facebook')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              使用 Facebook 繼續
            </button>
          </div>
        </div>

        <!-- 忘記密碼表單 -->
        <div v-show="activeTab === 'forgot'" class="form-container active">
          <div v-if="message" :class="messageClass">{{ message }}</div>

          <div class="forgot-password-header">
            <h2>忘記密碼？</h2>
            <p>請輸入您的電子郵件地址，我們將發送重設密碼的連結給您。</p>
          </div>
          <form @submit.prevent="handleForgotPassword">
            <div class="input-group">
              <label for="forgot-email">電子郵件</label>
              <input
                type="email"
                id="forgot-email"
                v-model="forgotPasswordForm.email"
                placeholder="請輸入您的電子郵件"
                required />
            </div>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? "發送中..." : "發送重設連結" }}
            </button>
            <button
              type="button"
              class="btn-secondary"
              @click="activeTab = 'login'"
              style="
                margin-top: 10px;
                width: 100%;
                padding: 14px;
                background: #f5f5f5;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
              ">
              返回登入
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref("login");
const isLoading = ref(false);
const message = ref("");
const messageType = ref("");

const loginForm = ref({
  account: "",
  password: "",
  rememberMe: false,
});

const registerForm = ref({
  account: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
});

const forgotPasswordForm = ref({
  email: "",
});

const messageClass = computed(() => ({
  "error-message": messageType.value === "error",
  "success-message": messageType.value === "success",
  show: !!message.value,
}));

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;

  if (type === "success") {
    setTimeout(() => {
      message.value = "";
    }, 3000);
  }
};

const handleLogin = async () => {
  message.value = "";
  isLoading.value = true;

  try {
    await authStore.login(loginForm.value.account, loginForm.value.password);
    showMessage("登入成功！", "success");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    showMessage(errorMessage, "error");
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  message.value = "";

  // 驗證密碼
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    showMessage("密碼與確認密碼不符", "error");
    return;
  }

  if (registerForm.value.password.length < 8) {
    showMessage("密碼長度至少需要 8 個字元", "error");
    return;
  }

  if (!registerForm.value.agreeTerms) {
    showMessage("請同意服務條款和隱私政策", "error");
    return;
  }

  isLoading.value = true;

  try {
    await authStore.register({
      account: registerForm.value.account,
      email: registerForm.value.email,
      password: registerForm.value.password,
      password_confirmation: registerForm.value.confirmPassword,
    });

    showMessage("註冊成功！請登入", "success");

    setTimeout(() => {
      activeTab.value = "login";
      loginForm.value.account = registerForm.value.account;
    }, 1500);
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    showMessage(errorMessage, "error");
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = async () => {
  message.value = "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(forgotPasswordForm.value.email)) {
    showMessage("請輸入有效的電子郵件地址", "error");
    return;
  }

  isLoading.value = true;

  try {
    // 模擬 API 呼叫
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showMessage("重設密碼連結已發送到您的信箱，請檢查您的電子郵件", "success");

    setTimeout(() => {
      forgotPasswordForm.value.email = "";
    }, 2000);
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    showMessage("發送失敗：" + errorMessage, "error");
  } finally {
    isLoading.value = false;
  }
};

const handleOAuthLogin = async (provider) => {
  message.value = "";

  try {
    await authStore.oauthLogin(provider);
    showMessage("登入成功！", "success");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  } catch (error) {
    showMessage(`${provider === "google" ? "Google" : "Facebook"} 登入失敗：${error.message}`, "error");
  }
};

const showForgotPassword = () => {
  activeTab.value = "forgot";
  message.value = "";
};

const getApiErrorMessage = (error) => {
  if (error.data) {
    const data = error.data;

    if (data.messages && typeof data.messages === "object") {
      const firstKey = Object.keys(data.messages)[0];
      if (firstKey && Array.isArray(data.messages[firstKey]) && data.messages[firstKey].length > 0) {
        return data.messages[firstKey][0];
      }
    }

    if (data.message) {
      return data.message;
    }
    if (data.error) {
      return data.error;
    }
  }

  return error.message || "發生未知錯誤";
};
</script>

<style scoped>
.login-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin: 0;
  overflow: hidden;
}

.container {
  width: 100%;
  max-width: 450px;
}

.login-box {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 30px 35px;
  animation: slideUp 0.5s ease-out;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-section {
  text-align: center;
  margin-bottom: 25px;
}

.logo-section h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 700;
}

.tab-container {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-group input::placeholder {
  color: #aaa;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
}

.checkbox-container input {
  margin-right: 8px;
  cursor: pointer;
}

.forgot-password,
.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover,
.link:hover {
  text-decoration: underline;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0 20px 0;
  color: #999;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  padding: 0 15px;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-social:hover {
  background: #f8f8f8;
  border-color: #d0d0d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-social svg {
  flex-shrink: 0;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.success-message {
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  animation: fadeIn 0.3s ease-in;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 25px;
}

.forgot-password-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 700;
}

.forgot-password-header p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .logo-section h1 {
    font-size: 24px;
  }

  .options {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
