<template>
    <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
        <div class="nav-container">
            <div class="nav-brand" @click="router.push('/')" style="cursor: pointer">
                <img src="@/assets/logo.png" :alt="t('header.logo_alt')" class="nav-logo" />
                <span class="nav-title">{{ appName }}</span>
            </div>
            <div class="nav-actions">
                <select v-model="locale" class="lang-select">
                    <option value="zh-TW">繁體中文</option>
                    <option value="en">English</option>
                </select>
                <template v-if="!isAuthenticated">
                    <button class="nav-btn nav-btn-text" @click="router.push('/login')">{{ t('header.login') }}</button>
                    <button class="nav-btn nav-btn-primary" @click="router.push('/login')">{{ t('header.start_now') }}</button>
                </template>
                <template v-else>
                    <button class="nav-btn nav-btn-text" @click="handleLogout">{{ t('header.logout') }}</button>
                    <button class="nav-btn nav-btn-primary" @click="router.push('/dashboard')">{{ t('header.dashboard') }}</button>
                </template>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { APP_NAME } from "@/config/app";

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const appName = APP_NAME;

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isScrolled = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
};

watch(locale, (newLocale) => {
    localStorage.setItem('user-locale', newLocale);
});

onMounted(() => {
    window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});

const handleLogout = () => {
    if (confirm(t('header.logout_confirm'))) {
        authStore.logout();
        router.push("/login");
    }
};
</script>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 20px 0;
    transition: all 0.3s ease;
    background: transparent;
}

.navbar-scrolled {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    padding: 16px 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.nav-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.nav-logo {
    height: 40px;
    width: auto;
}

.nav-title {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
}

.nav-actions {
    display: flex;
    gap: 16px;
    align-items: center;
}

.nav-btn {
    padding: 10px 20px;
    border-radius: 99px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.nav-btn-text {
    background: transparent;
    color: #64748b;
}

.nav-btn-text:hover {
    color: #0f172a;
}

.nav-btn-primary {
    background: #4338ca;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(67, 56, 202, 0.3);
}

.nav-btn-primary:hover {
    background: #3730a3;
    transform: translateY(-1px);
}

.lang-select {
    background: transparent;
    border: 1px solid #e2e8f0;
    color: #64748b;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
}

.lang-select:hover {
    border-color: #cbd5e1;
    color: #0f172a;
}
</style>
