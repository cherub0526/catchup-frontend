<template>
  <div class="settings-page">
    <div class="settings-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"/>
        </svg>
        返回
      </button>
      <h2>設定</h2>
    </div>
    <div class="settings-container">
      <div class="settings-section">
        <h3>帳號設定</h3>
        <div class="settings-item">
          <label>使用者名稱</label>
          <input type="text" v-model="username" placeholder="請輸入使用者名稱" />
        </div>
        <div class="settings-item">
          <label>電子郵件</label>
          <input type="email" v-model="email" placeholder="請輸入電子郵件" />
        </div>
      </div>

      <div class="settings-section">
        <h3>應用程式設定</h3>
        <div class="settings-item checkbox-item">
          <label>
            <input type="checkbox" v-model="notifications" />
            <span>啟用通知</span>
          </label>
        </div>
        <div class="settings-item checkbox-item">
          <label>
            <input type="checkbox" v-model="autoPlay" />
            <span>自動播放影片</span>
          </label>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-primary" @click="saveSettings">儲存設定</button>
        <button class="btn-secondary" @click="cancelSettings">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('使用者')
const email = ref('')
const notifications = ref(true)
const autoPlay = ref(false)

const goBack = () => {
  router.back()
}

const saveSettings = () => {
  // 這裡可以保存設定到 localStorage 或後端
  alert('設定已儲存！')
}

const cancelSettings = () => {
  goBack()
}
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
  font-size: 14px;
  font-weight: 600;
}

.back-btn:hover {
  background: #e9ecef;
}

.settings-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.settings-container {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-section h3 {
  font-size: 18px;
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
  font-size: 14px;
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
  font-size: 14px;
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
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
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
</style>

