<template>
  <div class="home-page">
    <!-- 導航欄 -->
    <!-- 導航欄 -->
    <AppHeader />

    <!-- 內容區塊 -->
    <main class="home-content">
      <!-- 英雄區塊 -->
      <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            {{ $t('home.hero.badge') }}
          </div>
          <h1 class="hero-title">
            {{ $t('home.hero.title_line1') }}<br />
            <span class="gradient-text">{{ $t('home.hero.title_line2') }}</span>
          </h1>
          <p class="hero-subtitle">
            {{ $t('home.hero.subtitle') }}
          </p>
          <div class="hero-actions">
            <button v-if="!isAuthenticated" class="btn-lg btn-primary" @click="router.push('/login')">
              <span>{{ $t('home.hero.start_now') }}</span>
              <font-awesome-icon icon="arrow-right" />
            </button>
            <button v-else class="btn-lg btn-primary" @click="router.push('/dashboard')">
              <span>{{ $t('home.hero.dashboard') }}</span>
              <font-awesome-icon icon="arrow-right" />
            </button>
            <button class="btn-lg btn-secondary" @click="scrollToFeatures">
              <span>{{ $t('home.hero.learn_more') }}</span>
              <font-awesome-icon icon="chevron-down" />
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">10k+</span>
              <span class="stat-label">{{ $t('home.hero.active_users') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">500+</span>
              <span class="stat-label">{{ $t('home.hero.supported_channels') }}</span>
            </div>
          </div>
        </div>
        <div class="hero-image-container">
          <div class="hero-blob"></div>
          <div class="hero-image-wrapper">
            <img src="@/assets/logo2.png" :alt="$t('home.hero.app_preview_alt')" class="hero-img" />
            <!-- Floating Cards -->
            <div class="floating-card card-video">
              <div class="card-icon icon-video">
                <font-awesome-icon icon="video" />
              </div>
              <div class="card-content">
                <span class="card-label">{{ $t('home.hero.latest_videos') }}</span>
                <span class="card-value">{{ $t('home.hero.just_updated') }}</span>
              </div>
            </div>
            <div class="floating-card card-analytics">
              <div class="card-icon icon-chart">
                <font-awesome-icon icon="chart-bar" />
              </div>
              <div class="card-content">
                <span class="card-label">{{ $t('home.hero.smart_analysis') }}</span>
                <span class="card-value">{{ $t('home.hero.summaries_completed') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特色區塊 -->
    <section class="features-section" ref="featuresSection">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.features.title') }}</h2>
          <p class="section-subtitle">{{ $t('home.features.subtitle') }}</p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon-wrapper" :style="{ background: feature.bg }">
              <font-awesome-icon :icon="feature.icon" :style="{ color: feature.color }" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用流程區塊 -->
    <section class="how-it-works-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.how_it_works.title') }}</h2>
          <p class="section-subtitle">{{ $t('home.how_it_works.subtitle') }}</p>
        </div>

        <div class="steps-wrapper">
          <div class="steps-line"></div>
          <div class="steps-grid">
            <div class="step-card" v-for="(step, index) in steps" :key="index">
              <div class="step-number">{{ index + 1 }}</div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 區塊 -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">{{ $t('home.cta.title') }}</h2>
        <p class="cta-subtitle">{{ $t('home.cta.subtitle') }}</p>
        <button v-if="!isAuthenticated" class="btn-lg btn-white" @click="router.push('/login')">
          <span>{{ $t('home.cta.start_free') }}</span>
          <font-awesome-icon icon="arrow-right" />
        </button>
        <button v-else class="btn-lg btn-white" @click="router.push('/dashboard')">
          <span>{{ $t('home.cta.dashboard') }}</span>
          <font-awesome-icon icon="arrow-right" />
        </button>
      </div>
    </section>

    </main>
    <!-- 頁尾 -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { APP_NAME, APP_DESCRIPTION } from "@/config/app";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const appName = APP_NAME;
const appDescription = APP_DESCRIPTION;

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const handleLogout = () => {
  if (confirm(t('home.logout_confirm'))) {
    authStore.logout();
    router.push("/login");
  }
};

const featuresSection = ref(null);

const features = computed(() => [
  {
    icon: "infinity",
    title: t('home.features.items.universal_ai.title'),
    description: t('home.features.items.universal_ai.desc'),
    color: "#6366f1",
    bg: "#e0e7ff",
  },
  {
    icon: "video",
    title: t('home.features.items.multi_platform.title'),
    description: t('home.features.items.multi_platform.desc'),
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    icon: "bolt",
    title: t('home.features.items.real_time.title'),
    description: t('home.features.items.real_time.desc'),
    color: "#ec4899",
    bg: "#fce7f3",
  },
  {
    icon: "magic",
    title: t('home.features.items.ai_summary.title'),
    description: t('home.features.items.ai_summary.desc'),
    color: "#06b6d4",
    bg: "#cffafe",
  },
  {
    icon: "comment-alt",
    title: t('home.features.items.custom_prompt.title'),
    description: t('home.features.items.custom_prompt.desc'),
    color: "#10b981",
    bg: "#d1fae5",
  },
  {
    icon: "comments",
    title: t('home.features.items.ai_chat.title'),
    description: t('home.features.items.ai_chat.desc'),
    color: "#f59e0b",
    bg: "#fef3c7",
  },
]);

const steps = computed(() => [
  {
    title: t('home.how_it_works.steps.register.title'),
    description: t('home.how_it_works.steps.register.desc'),
  },
  {
    title: t('home.how_it_works.steps.connect.title'),
    description: t('home.how_it_works.steps.connect.desc'),
  },
  {
    title: t('home.how_it_works.steps.enjoy.title'),
    description: t('home.how_it_works.steps.enjoy.desc'),
  },
]);

const scrollToFeatures = () => {
  if (featuresSection.value) {
    featuresSection.value.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style scoped>
/* Reset & Base */
.home-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #1e293b;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

.home-content {
  flex: 1;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Navbar */
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
  font-size: 1.625rem;
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
  font-size: 1.0625rem;
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

/* Hero Section */
.hero-section {
  padding-top: 160px;
  padding-bottom: 100px;
  background: radial-gradient(circle at top right, #eef2ff 0%, #ffffff 40%);
  overflow: hidden;
}

.hero-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: #eef2ff;
  color: #4338ca;
  border-radius: 99px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #4338ca;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.hero-title {
  font-size: 4.125rem;
  line-height: 1.1;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 24px;
  letter-spacing: -1.5px;
}

.gradient-text {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.375rem;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 40px;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.btn-lg {
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #4338ca;
  color: white;
  box-shadow: 0 10px 25px -5px rgba(67, 56, 202, 0.4);
}

.btn-primary:hover {
  background: #3730a3;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(67, 56, 202, 0.3);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.625rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  font-size: 1rem;
  color: #64748b;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

.hero-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.6;
}

.hero-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.hero-img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15));
  animation: float 6s ease-in-out infinite;
}

.floating-card {
  position: absolute;
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
  animation: float 5s ease-in-out infinite;
}

.card-video {
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.card-analytics {
  bottom: 15%;
  right: -5%;
  animation-delay: 2.5s;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
}

.icon-video {
  background: #eef2ff;
  color: #4338ca;
}

.icon-chart {
  background: #ecfdf5;
  color: #10b981;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.card-value {
  font-size: 0.875rem;
  color: #64748b;
}

/* Features Section */
.features-section {
  padding: 120px 0;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.features-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: radial-gradient(circle at 0% 0%, #f8fafc 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, #f1f5f9 0%, transparent 50%);
  z-index: 0;
}

.features-section .container {
  position: relative;
  z-index: 1;
}

.section-header {
  text-align: center;
  max-width: 768px;
  margin: 0 auto 80px;
}

.section-title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 32px;
}

.feature-card {
  padding: 48px 32px;
  border-radius: 24px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(67, 56, 202, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.04);
  border-color: rgba(67, 56, 202, 0.2);
}

.feature-card:hover::before {
  transform: translateX(100%);
}

.feature-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.875rem;
  margin-bottom: 32px;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-size: 1.625rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
}

.feature-description {
  font-size: 1.125rem;
  color: #64748b;
  line-height: 1.7;
}

/* How It Works */
.how-it-works-section {
  padding: 120px 0;
  background: #f8fafc;
}

.steps-wrapper {
  position: relative;
  margin-top: 80px;
}

.steps-line {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
  display: none;
}

@media (min-width: 1024px) {
  .steps-line {
    display: block;
  }
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  position: relative;
  z-index: 1;
}

.step-card {
  text-align: center;
  padding: 0 20px;
}

.step-number {
  width: 80px;
  height: 80px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.125rem;
  font-weight: 800;
  color: #4338ca;
  margin: 0 auto 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.step-title {
  font-size: 1.625rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
}

.step-description {
  font-size: 1.125rem;
  color: #64748b;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 100px 24px;
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  color: white;
}

.cta-title {
  font-size: 3.125rem;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -1px;
}

.cta-subtitle {
  font-size: 1.375rem;
  margin-bottom: 48px;
  opacity: 0.9;
}

.btn-white {
  background: white;
  color: #4338ca;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.btn-white:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

/* Footer */
.footer {
  background: #0f172a;
  color: #94a3b8;
  padding: 80px 0 32px;
  font-size: 0.9375rem;
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 64px;
  margin-bottom: 64px;
}

.footer-brand-col {
  max-width: 320px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.footer-desc {
  line-height: 1.6;
  margin-bottom: 32px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #4338ca;
  transform: translateY(-2px);
}

.footer-heading {
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 24px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: white;
}

.newsletter-desc {
  margin-bottom: 24px;
  line-height: 1.6;
}

.input-group {
  display: flex;
  gap: 8px;
}

.newsletter-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.newsletter-input:focus {
  outline: none;
  border-color: #4338ca;
  background: rgba(255, 255, 255, 0.1);
}

.newsletter-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #4338ca;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.newsletter-btn:hover {
  background: #3730a3;
  transform: translateY(-2px);
}

.footer-bottom {
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-legal {
  display: flex;
  gap: 24px;
}

.footer-legal a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-legal a:hover {
  color: white;
}

.copyright {
  color: #64748b;
  font-size: 0.875rem;
}

/* Animations */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(67, 56, 202, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(67, 56, 202, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(67, 56, 202, 0);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 3rem;
  }

  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero-content {
    order: 2;
  }

  .hero-image-container {
    order: 1;
  }

  .hero-subtitle {
    margin: 0 auto 40px;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .floating-card {
    display: none;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2.25rem;
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-brand-col {
    max-width: 100%;
  }


  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}


.footer-logo {
  max-height: 50px;
}

@media (max-width: 640px) {
  .nav-actions {
    display: none;
  }

  .hero-title {
    font-size: 2.25rem;
  }
}
</style>
