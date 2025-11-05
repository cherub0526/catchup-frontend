<template>
  <div class="player-page">
    <div class="player-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z" />
        </svg>
        返回
      </button>
      <h2 class="player-title">{{ title }}</h2>
    </div>
    <div class="player-container">
      <div class="video-placeholder">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
        <p>影片播放器</p>
        <p class="video-url">{{ url }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const title = ref(route.query.title || "未知標題");
const source = ref(route.query.source || "unknown");
const url = ref(route.query.url || "#");

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.player-page {
  width: 100%;
  height: 100vh;
  background: #000;
  color: white;
  display: flex;
  flex-direction: column;
}

.player-header {
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.player-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.player-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.video-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.video-placeholder svg {
  margin-bottom: 20px;
  opacity: 0.5;
}

.video-placeholder p {
  font-size: 16px;
  margin-bottom: 10px;
}

.video-url {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
