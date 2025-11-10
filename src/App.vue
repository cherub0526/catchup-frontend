<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 全局應用配置
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 應用啟動時初始化認證狀態
onMounted(async () => {
  await authStore.initAuth();
  
  // 如果已經登入且當前在登入頁面或根路徑，則跳轉到 dashboard
  if (authStore.isAuthenticated) {
    if (route.path === '/login' || route.path === '/') {
      router.replace('/dashboard');
    }
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

