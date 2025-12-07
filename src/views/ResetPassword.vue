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

        <!-- 重設密碼表單 -->
        <div class="form-container active">
          <div v-if="message" :class="messageClass">{{ message }}</div>

          <div class="reset-password-header">
            <h2>{{ $t('login.reset_password.title') }}</h2>
            <p>{{ $t('login.reset_password.desc') }}</p>
          </div>

          <form @submit.prevent="handleResetPassword">
            <div class="input-group">
              <label for="new-password">{{ $t('login.password') }}</label>
              <input type="password" id="new-password" v-model="resetForm.password"
                :placeholder="$t('login.password_min_length')" required minlength="8" />
            </div>
            <div class="input-group">
              <label for="confirm-password">{{ $t('login.confirm_password') }}</label>
              <input type="password" id="confirm-password" v-model="resetForm.confirmPassword"
                :placeholder="$t('login.confirm_password_placeholder')" required />
            </div>
            
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? $t('login.processing') : $t('login.reset_password.submit') }}
            </button>
            
            <div class="divider">
              <span>{{ $t('login.or') }}</span>
            </div>

            <button type="button" class="btn-secondary" @click="goToLogin">
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
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { APP_NAME } from "@/config/app";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();

// 應用配置
const appName = ref(APP_NAME);

const isLoading = ref(false);
const message = ref("");
const messageType = ref("");

const resetForm = ref({
  password: "",
  confirmPassword: "",
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

const handleResetPassword = async () => {
  message.value = "";

  // 驗證密碼
  if (resetForm.value.password !== resetForm.value.confirmPassword) {
    showMessage(t('login.password_mismatch'), "error");
    return;
  }

  if (resetForm.value.password.length < 8) {
    showMessage(t('login.password_length_error'), "error");
    return;
  }

  isLoading.value = true;

  try {
    // 傳送新密碼和 URL 上的 query 參數
    await authStore.resetPassword({
      password: resetForm.value.password,
      password_confirmation: resetForm.value.confirmPassword
    }, route.query);
    await authStore.initAuth();

    showMessage(t('login.reset_password.success'), "success");

    setTimeout(() => {
        router.push("/dashboard");
    }, 1500);
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    showMessage(errorMessage, "error");
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push("/login");
};

const getApiErrorMessage = (error) => {
  if (error.data) {
    const data = error.data;

    if (data.messages && typeof data.messages === "object") {
      // 嘗試獲取第一個錯誤訊息
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
  font-size: 2.125rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: 700;
}

.logo-section .slogan {
  font-size: 1rem;
  color: #667eea;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
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
  font-size: 1rem;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
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

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.125rem;
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

.btn-secondary {
  width: 100%;
  padding: 14px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #eeeeee;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #999;
  font-size: 0.9375rem;
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

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 1rem;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.success-message {
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 1rem;
  animation: fadeIn 0.3s ease-in;
}

.reset-password-header {
  text-align: center;
  margin-bottom: 25px;
}

.reset-password-header h2 {
  font-size: 1.625rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: 700;
}

.reset-password-header p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
}
</style>
