<template>
  <div class="settings-page">
    <div class="settings-header">
      <button class="back-btn" @click="goBack">
        <font-awesome-icon icon="arrow-left" />
        {{ t('back') }}
      </button>
      <h2>{{ t('settings') }}</h2>
    </div>
    <div class="settings-container">
      <div class="settings-section">
        <h3>{{ t('subscription_settings') }}</h3>
        <div class="settings-item">
          <label>{{ t('current_plan') }}</label>
          <div class="plan-info">
            <span class="plan-name">{{ plansStore.currentPlan?.name || 'Free' }}</span>
            <button 
              v-if="plansStore.currentPlan?.id !== 'free'" 
              class="btn-danger" 
              @click="handleCancelSubscription"
              :disabled="cancelingSubscription"
            >
              {{ cancelingSubscription ? t('processing') : t('cancel_subscription') }}
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>{{ t('account_settings') }}</h3>
        <div v-if="loading" class="loading-state">
          {{ t('loading') }}
        </div>
        <template v-else>
          <div class="settings-item">
            <label>{{ t('username') }}</label>
            <input type="text" v-model="username" :placeholder="t('username_placeholder')" :disabled="loading" />
          </div>
          <div class="settings-item">
            <label>{{ t('email') }}</label>
            <input type="email" v-model="email" :placeholder="t('email_placeholder')" :disabled="loading" />
          </div>
        </template>
      </div>

      

      <div class="settings-section">
        <h3>{{ t('app_settings') }}</h3>
        <div class="settings-item checkbox-item">
          <label>
            <input type="checkbox" v-model="notifications" />
            <span>{{ t('enable_notifications') }}</span>
          </label>
        </div>
        <div class="settings-item checkbox-item">
          <label>
            <input type="checkbox" v-model="autoPlay" />
            <span>{{ t('auto_play_videos') }}</span>
          </label>
        </div>
        <div class="settings-item">
          <label>{{ t('ai_response_language') }}</label>
          <select v-model="preferredLanguage" class="language-select">
            <option value="zh-TW">{{ t('language_zh_tw') }}</option>
            <option value="en">{{ t('language_en') }}</option>
          </select>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-primary" @click="saveSettings" :disabled="loading || saving">
          {{ saving ? t('saving') : t('save') }}
        </button>
        <button class="btn-secondary" @click="cancelSettings" :disabled="loading || saving">{{ t('cancel') }}</button>
      </div>
    </div>

    <!-- 訊息提示 -->
    <transition name="message-fade">
      <div v-if="message.text" :class="['message-toast', `message-${message.type}`]">
        <div class="message-content">
          <span class="message-icon">
            <font-awesome-icon v-if="message.type === 'success'" icon="check-circle" />
            <font-awesome-icon v-else-if="message.type === 'error'" icon="exclamation-circle" />
          </span>
          <span class="message-text">{{ message.text }}</span>
        </div>
        <button class="message-close" @click="clearMessage">
          <font-awesome-icon icon="times" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { usePlansStore } from '@/stores/plans'

const router = useRouter()
const authStore = useAuthStore()
const plansStore = usePlansStore()
const { t, locale } = useI18n()

const username = ref('')
const email = ref('')
const preferredLanguage = ref('zh-TW')
const notifications = ref(true)
const autoPlay = ref(false)
const loading = ref(false)
const saving = ref(false)
const cancelingSubscription = ref(false)
const message = ref({ text: '', type: 'success' })
let messageTimer = null

// 從 API 獲取使用者資料
const fetchUserData = async () => {
  loading.value = true
  try {
    // 優先從 auth store 獲取使用者資料
    if (authStore.user) {
      username.value = authStore.user.name || authStore.user.username || ''
      email.value = authStore.user.email || ''
    } else {
      // 如果 store 中沒有，則從 API 獲取
      const userData = await api.user.getCurrentUser()
      username.value = userData.name || userData.username || ''
      email.value = userData.email || ''
      // 更新 auth store
      authStore.user = userData
    }
    
    // 設定偏好語言
    if (authStore.user) {
      preferredLanguage.value = authStore.user.preferred_language || locale.value
    }
  } catch (error) {
    console.error(t('fetch_user_failed'), error)
    // 如果 API 失敗，嘗試從 auth store 獲取
    if (authStore.user) {
      username.value = authStore.user.name || authStore.user.username || ''
      email.value = authStore.user.email || ''
    }
  } finally {
    loading.value = false
  }
}

// 顯示訊息
const showMessage = (text, type = 'success') => {
  message.value = { text, type }
  
  // 清除之前的計時器
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
  
  // 3 秒後自動清除訊息
  messageTimer = setTimeout(() => {
    clearMessage()
  }, 3000)
}

// 清除訊息
const clearMessage = () => {
  message.value = { text: '', type: 'success' }
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
}

// 從錯誤物件中提取錯誤訊息
const getErrorMessage = (error) => {
  // API client 會 reject error.response，所以先檢查 response.data
  if (error?.data) {
    // 嘗試從不同可能的欄位獲取錯誤訊息
    const errorMsg = error.data.message || 
                     error.data.error || 
                     error.data.msg || 
                     error.data.detail ||
                     (typeof error.data === 'string' ? error.data : null)
    
    if (errorMsg) {
      return errorMsg
    }
  }
  
  // 如果錯誤有 response 和 response.data（axios 原始錯誤格式）
  if (error?.response?.data) {
    const errorMsg = error.response.data.message || 
                     error.response.data.error || 
                     error.response.data.msg || 
                     error.response.data.detail ||
                     (typeof error.response.data === 'string' ? error.response.data : null)
    
    if (errorMsg) {
      return errorMsg
    }
  }
  
  // 如果錯誤有 message
  if (error?.message) {
    return error.message
  }
  
  // 根據 HTTP 狀態碼提供預設訊息
  if (error?.status) {
    if (error.status === 400) {
      return t('error_400')
    } else if (error.status === 401) {
      return t('error_401')
    } else if (error.status === 403) {
      return t('error_403')
    } else if (error.status === 404) {
      return t('error_404')
    } else if (error.status === 409) {
      return t('error_409')
    } else if (error.status >= 500) {
      return t('error_500')
    }
  }
  
  // 預設錯誤訊息
  return t('settings_save_failed')
}

const goBack = () => {
  router.back()
}

const saveSettings = async () => {
  // 基本驗證
  if (!username.value.trim()) {
    showMessage(t('username_required'), 'error')
    return
  }
  
  if (!email.value.trim()) {
    showMessage(t('email_required'), 'error')
    return
  }
  
  // 驗證電子郵件格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    showMessage(t('email_invalid'), 'error')
    return
  }
  
  saving.value = true
  clearMessage() // 清除之前的訊息
  
  try {
    // 更新使用者資料到 API (PUT /v1/users)
    const updateData = {
      name: username.value.trim(),
      email: email.value.trim(),
      preferred_language: preferredLanguage.value
    }
    
    const response = await api.user.updateProfile(updateData)
    
    // 更新 auth store 中的使用者資料
    if (authStore.user) {
      authStore.user = {
        ...authStore.user,
        ...updateData
      }
    }
    
    // 顯示成功訊息
    showMessage(t('settings_saved'), 'success')
  } catch (error) {
    console.error('儲存設定失敗:', error)
    
    // 提取並顯示錯誤訊息
    const errorMessage = getErrorMessage(error)
    showMessage(errorMessage, 'error')
  } finally {
    saving.value = false
  }
}

const handleCancelSubscription = async () => {
  if (!confirm(t('cancel_subscription_confirm'))) return
  
  cancelingSubscription.value = true
  try {
    await plansStore.cancelSubscription()
    showMessage(t('subscription_canceled'), 'success')
  } catch (error) {
    console.error(error)
    showMessage(getErrorMessage(error), 'error')
  } finally {
    cancelingSubscription.value = false
  }
}

const cancelSettings = () => {
  // 取消時重新載入原始資料
  fetchUserData()
  goBack()
}

// 組件掛載時載入使用者資料
onMounted(() => {
  fetchUserData()
  plansStore.fetchCurrentSubscription()
})

// 組件卸載時清理計時器
onUnmounted(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
})
</script>

<style scoped>
.settings-page {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.settings-header {
  background: white;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
}

.back-btn:hover {
  background: #e9ecef;
}

.settings-header h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: #333;
}

.settings-container {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 800px;
}

.settings-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f5f7fa;
}

.settings-item {
  margin-bottom: 20px;
}

.settings-item:last-child {
  margin-bottom: 0;
}

.settings-item label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.settings-item input[type="text"],
.settings-item input[type="email"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.settings-item input[type="text"]:focus,
.settings-item input[type="email"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.checkbox-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-item span {
  font-weight: 500;
}

.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  width: 100%;
  max-width: 800px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #666;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #d0d0d0;
}

.btn-danger {
  padding: 8px 16px;
  background-color: #fff;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background-color: #ef4444;
  color: white;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.plan-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.plan-name {
  font-weight: 600;
  color: #333;
  font-size: 1.125rem;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-state {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 1rem;
}

.settings-item input:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

/* 訊息提示樣式 */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 500px;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.message-success {
  background: #10b981;
  color: white;
}

.message-error {
  background: #ef4444;
  color: white;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.message-icon {
  font-size: 1.375rem;
  flex-shrink: 0;
}

.message-text {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.message-close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.message-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.message-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.language-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}
</style>

