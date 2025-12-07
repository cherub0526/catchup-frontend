<template>
  <div class="login-page">
    <div class="container">
      <div class="login-box">
        <!-- Logo 區域 -->
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
          <h1>{{ appName }}</h1>
          <p class="slogan">{{ $t('login.slogan') }}</p>
        </div>

        <!-- 標籤切換 -->
        <div class="tab-container">
          <button class="tab-btn" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">{{ $t('login.tab_login') }}</button>
          <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
            {{ $t('login.tab_register') }}
          </button>
        </div>

        <!-- 登入表單 -->
        <div v-show="activeTab === 'login'" class="form-container active">
          <div v-if="message" :class="messageClass">{{ message }}</div>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="login-account">{{ $t('login.account') }}</label>
              <input type="text" id="login-account" v-model="loginForm.account" :placeholder="$t('login.account_placeholder')" required />
            </div>
            <div class="input-group">
              <label for="login-password">{{ $t('login.password') }}</label>
              <input type="password" id="login-password" v-model="loginForm.password" :placeholder="$t('login.password_placeholder')" required />
            </div>
            <div class="options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="loginForm.rememberMe" />
                <span>{{ $t('login.remember_me') }}</span>
              </label>
              <a href="#" class="forgot-password" @click.prevent="showForgotPassword">{{ $t('login.forgot_password') }}</a>
            </div>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? $t('login.logging_in') : $t('login.login_btn') }}
            </button>
          </form>

          <!-- 分隔線 -->
          <div class="divider">
            <span>{{ $t('login.or') }}</span>
          </div>

          <!-- 社群登入按鈕 -->
          <div class="social-login">
            <button class="btn-social btn-google" @click="handleOAuthLogin('google')">
              <font-awesome-icon :icon="['fab', 'google']" class="social-icon" />
              {{ $t('login.continue_with_google') }}
            </button>
            <button class="btn-social btn-facebook" @click="handleOAuthLogin('facebook')">
              <font-awesome-icon :icon="['fab', 'facebook']" class="social-icon" />
              {{ $t('login.continue_with_facebook') }}
            </button>
          </div>
        </div>

        <!-- 註冊表單 -->
        <div v-show="activeTab === 'register'" class="form-container active">
          <div v-if="message" :class="messageClass">{{ message }}</div>

          <form @submit.prevent="handleRegister">
            <div class="input-group">
              <label for="register-account">{{ $t('login.account') }}</label>
              <input type="text" id="register-account" v-model="registerForm.account" :placeholder="$t('login.account_placeholder')" required />
            </div>
            <div class="input-group">
              <label for="register-email">{{ $t('login.email') }}</label>
              <input type="email" id="register-email" v-model="registerForm.email" :placeholder="$t('login.email_placeholder')" required />
            </div>
            <div class="input-group">
              <label for="register-password">{{ $t('login.password') }}</label>
              <input type="password" id="register-password" v-model="registerForm.password"
                :placeholder="$t('login.password_min_length')" required minlength="8" />
            </div>
            <div class="input-group">
              <label for="register-confirm-password">{{ $t('login.confirm_password') }}</label>
              <input type="password" id="register-confirm-password" v-model="registerForm.confirmPassword"
                :placeholder="$t('login.confirm_password_placeholder')" required />
            </div>
            <div class="options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="registerForm.agreeTerms" required />
                <span>{{ $t('login.agree') }}<a href="#" class="link">{{ $t('login.terms') }}</a>{{ $t('login.and') }}<a href="#" class="link">{{ $t('login.privacy') }}</a></span>
              </label>
            </div>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? $t('login.registering') : $t('login.register_btn') }}
            </button>
          </form>

          <!-- 分隔線 -->
          <div class="divider">
            <span>{{ $t('login.or') }}</span>
          </div>

          <!-- 社群登入按鈕 -->
          <div class="social-login">
            <button class="btn-social btn-google" @click="handleOAuthLogin('google')">
              <font-awesome-icon :icon="['fab', 'google']" class="social-icon" />
              {{ $t('login.continue_with_google') }}
            </button>
            <button class="btn-social btn-facebook" @click="handleOAuthLogin('facebook')">
              <font-awesome-icon :icon="['fab', 'facebook']" class="social-icon" />
              {{ $t('login.continue_with_facebook') }}
            </button>
          </div>
        </div>

        <!-- 忘記密碼表單 -->
        <div v-show="activeTab === 'forgot'" class="form-container active">
          <div v-if="message" :class="messageClass">{{ message }}</div>

          <div class="forgot-password-header">
            <h2>{{ $t('login.forgot_password_title') }}</h2>
            <p>{{ $t('login.forgot_password_desc') }}</p>
          </div>
          <form @submit.prevent="handleForgotPassword">
            <div class="input-group">
              <label for="forgot-account">{{ $t('login.account') }}</label>
              <input type="text" id="forgot-account" v-model="forgotPasswordForm.account" :placeholder="$t('login.account_placeholder')"
                required />
            </div>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? $t('login.sending') : $t('login.send_reset_link') }}
            </button>
            <button type="button" class="btn-secondary" @click="activeTab = 'login'" style="
                margin-top: 10px;
                width: 100%;
                padding: 14px;
                background: #f5f5f5;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
              ">
              {{ $t('login.back_to_login') }}
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
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { APP_NAME } from "@/config/app";

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

// 應用配置
const appName = ref(APP_NAME);

const activeTab = ref("login");
const isLoading = ref(false);
const message = ref("");
const messageType = ref("");

const loginForm = ref({
  account: "",
  password: "",
  rememberMe: true,
});

const registerForm = ref({
  account: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeTerms: true,
});

const forgotPasswordForm = ref({
  account: "",
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
    await authStore.initAuth();
    showMessage(t('login.login_success'), "success");

    setTimeout(() => {
      const redirectPath = router.currentRoute.value.query.redirect;
      if (redirectPath) {
        router.push({
          path: redirectPath,
          query: {
            ...router.currentRoute.value.query,
            redirect: undefined // Remove redirect from query
          }
        });
      } else {
        router.push("/dashboard");
      }
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
    showMessage(t('login.password_mismatch'), "error");
    return;
  }

  if (registerForm.value.password.length < 8) {
    showMessage(t('login.password_length_error'), "error");
    return;
  }

  if (!registerForm.value.agreeTerms) {
    showMessage(t('login.agree_error'), "error");
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



    showMessage(t('login.register_success'), "success");

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

  if (!forgotPasswordForm.value.account) {
    return;
  }

  isLoading.value = true;

  try {
    await authStore.forgotPassword(forgotPasswordForm.value.account);

    showMessage(t('login.reset_link_sent'), "success");

    setTimeout(() => {
      forgotPasswordForm.value.account = "";
    }, 2000);
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    showMessage(t('login.send_failed') + errorMessage, "error");
  } finally {
    isLoading.value = false;
  }
};

const handleOAuthLogin = async (provider) => {
  message.value = "";

  try {
    await authStore.oauthLogin(provider);
    showMessage(t('login.login_success'), "success");

    setTimeout(() => {
      const redirectPath = router.currentRoute.value.query.redirect;
      if (redirectPath) {
        router.push({
          path: redirectPath,
          query: {
            ...router.currentRoute.value.query,
            redirect: undefined
          }
        });
      } else {
        router.push("/dashboard");
      }
    }, 1000);
  } catch (error) {
    showMessage((provider === "google" ? t('login.google_login_failed') : t('login.facebook_login_failed')) + error.message, "error");
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

  return error.message || t('login.unknown_error');
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

.logo-image {
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
  object-fit: contain;
}

.logo-section h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: 700;
}

.logo-section .slogan {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
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
  font-size: 0.9375rem;
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
  font-size: 0.875rem;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.875rem;
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
  font-size: 0.8125rem;
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
  font-size: 1rem;
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
  font-size: 0.8125rem;
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
  font-size: 0.875rem;
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

.btn-social .social-icon {
  flex-shrink: 0;
  font-size: 1.125rem;
}

.btn-google .social-icon {
  color: #4285f4;
}

.btn-facebook .social-icon {
  color: #1877f2;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
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
  font-size: 0.875rem;
  animation: fadeIn 0.3s ease-in;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 25px;
}

.forgot-password-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: 700;
}

.forgot-password-header p {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .logo-section h1 {
    font-size: 1.5rem;
  }

  .options {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
