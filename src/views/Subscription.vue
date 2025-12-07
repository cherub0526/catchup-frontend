<template>
  <div class="subscription-page">
    <AppHeader />
    <div class="subscription-container">

      <div class="subscription-header">
        <h1>{{ $t('subscription.title') }}</h1>
        <p class="subtitle">{{ $t('subscription.subtitle') }}</p>
      </div>

      <!-- 計費週期切換 -->
      <div class="billing-toggle">
        <button :class="['toggle-btn', { active: billingCycle === 'monthly' }]" @click="billingCycle = 'monthly'">
          {{ $t('subscription.billing.monthly') }}
        </button>
        <button :class="['toggle-btn', { active: billingCycle === 'annually' }]" @click="billingCycle = 'annually'">
          {{ $t('subscription.billing.annually') }}
          <span class="savings-badge">{{ $t('subscription.billing.save20') }}</span>
        </button>
      </div>

      <!-- 當前使用情況 -->
      <div v-if="currentPlan" class="current-plan-info">
        <div class="info-card">
          <h3>{{ $t('subscription.current_plan.title', { planName: currentPlan.name }) }}</h3>
          <div class="usage-stats">
            <div class="usage-item">
              <span class="usage-label">{{ $t('subscription.usage.channels') }}</span>
              <span class="usage-value">{{ usage.channels }} / {{ currentLimits.channels }}</span>
              <div class="usage-bar">
                <div class="usage-progress" :style="{ width: `${(usage.channels / currentLimits.channels) * 100}%` }"
                  :class="{ 'limit-reached': isChannelLimitReached }"></div>
              </div>
            </div>
            <div class="usage-item">
              <span class="usage-label">{{ $t('subscription.usage.media') }}</span>
              <span class="usage-value">{{ usage.media }} / {{ currentLimits.media }}</span>
              <div class="usage-bar">
                <div class="usage-progress" :style="{ width: `${(usage.media / currentLimits.media) * 100}%` }"
                  :class="{ 'limit-reached': isMediaLimitReached }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案列表 -->
      <div class="plans-grid">
        <div v-for="plan in allPlans" :key="plan.id" :class="[
          'plan-card',
          {
            current: isCurrentPlan(plan),
            recommended: plan.id === 'basic',
          },
        ]">
          <div v-if="plan.id === 'basic'" class="recommended-badge">{{ $t('subscription.plan.recommended') }}</div>

          <div class="plan-header">
            <h2 class="plan-name">{{ plan.name }}</h2>
            <div class="plan-price">
              <span class="price-amount">${{ getPlanPrice(plan, billingCycle) }}</span>
              <span class="price-period">{{ billingCycle === "monthly" ? $t('subscription.plan.per_month') : $t('subscription.plan.per_year') }}</span>
            </div>
            <div v-if="billingCycle === 'annually' && plan.price.monthly?.price > 0" class="yearly-savings">
              {{ $t('subscription.plan.yearly_savings', { amount: getYearlySavings(plan) }) }}
            </div>
          </div>

          <div class="plan-limits">
            <div class="limit-item">
              <font-awesome-icon icon="users" class="icon" />
              <span>{{ $t('subscription.plan.limits.channels', { count: plan.limits.channels }) }}</span>
            </div>
            <div class="limit-item">
              <font-awesome-icon icon="video" class="icon" />
              <span>{{ $t('subscription.plan.limits.media', { count: plan.limits.media }) }}</span>
            </div>
          </div>

          <div class="plan-features">
            <div v-for="(feature, index) in plan.features" :key="index" class="feature-item">
              <font-awesome-icon icon="check" class="check-icon" />
              <span>{{ feature }}</span>
            </div>
          </div>

          <button :class="[
            'subscribe-btn',
            {
              'current-plan': isCurrentPlan(plan),
              upgrade: (!isCurrentPlan(plan) && getPlanValue(currentPlan) < getPlanValue(plan)) || !authStore.isAuthenticated,
              downgrade: !isCurrentPlan(plan) && getPlanValue(currentPlan) > getPlanValue(plan),
            },
          ]" @click="handlePlanChange(plan)" :disabled="isLoading || isCurrentPlan(plan)">
            <span v-if="!authStore.isAuthenticated">{{ $t('subscription.button.subscribe') }}</span>
            <span v-else-if="isCurrentPlan(plan)">{{ $t('subscription.button.current') }}</span>
            <span v-else-if="!currentPlan || getPlanValue(currentPlan) < getPlanValue(plan)">{{ $t('subscription.button.upgrade') }}</span>
            <span v-else-if="getPlanValue(currentPlan) > getPlanValue(plan)">{{ $t('subscription.button.downgrade') }}</span>
          </button>
        </div>
      </div>

      <!-- 方案比較表 -->
      <div class="comparison-section">
        <h2>{{ $t('subscription.comparison.title') }}</h2>
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>{{ $t('subscription.comparison.feature') }}</th>
                <th v-for="plan in allPlans" :key="plan.id">{{ plan.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ $t('subscription.usage.channels') }}</td>
                <td v-for="plan in allPlans" :key="plan.id">{{ plan.limits.channels }}</td>
              </tr>
              <tr>
                <td>{{ $t('subscription.usage.media') }}</td>
                <td v-for="plan in allPlans" :key="plan.id">{{ plan.limits.media }}</td>
              </tr>
              <tr>
                <td>{{ $t('subscription.comparison.priority_support') }}</td>
                <td v-for="plan in allPlans" :key="plan.id">
                  <font-awesome-icon v-if="plan.id === 'advance'" icon="check" class="check-icon" />
                  <font-awesome-icon v-else icon="times" class="x-icon" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="2" />
          <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round" />
          <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span>{{ error }}</span>
        <button @click="error = null" class="close-btn">×</button>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePlansStore } from "@/stores/plans";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { initPaddle, openSubscriptionCheckout, setupPaddleListeners, destroyPaddle, getPaddle } from "@/utils/paddle";
import api from "@/api";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const plansStore = usePlansStore();
const authStore = useAuthStore();

const {
  currentPlan,
  currentSubscriptionData,
  allPlans,
  isLoading,
  error,
  usage,
  currentLimits,
  isChannelLimitReached,
  isMediaLimitReached,
} = storeToRefs(plansStore);

const { getPlanPrice, getPlanPriceId, getPlanApiPriceId, getYearlySavings, updateSubscription, initialize } =
  plansStore;

const billingCycle = ref("monthly");
const pendingSubscriptionResponse = ref(null);

// 獲取方案的數值（用於比較）
const getPlanValue = (plan) => {
  if (!plan) {
    return 0;
  }
  const planValues = { free: 0, basic: 1, advance: 2 };
  return planValues[plan.id] || 0;
};

// 判斷是否為當前方案
const isCurrentPlan = (plan) => {
  if (!currentSubscriptionData.value) {
    return false;
  }

  // 比對 plan.apiId 和 currentSubscriptionData.id
  const isPlanMatch = plan.apiId === currentSubscriptionData.value.id;

  // 如果沒有價格 ID，只比對方案 ID
  return isPlanMatch;
};

// 處理方案變更
const handlePlanChange = async (plan) => {
  if (isCurrentPlan(plan)) {
    return;
  }

  try {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      router.push({
        path: '/login',
        query: {
          redirect: '/subscription',
          planId: plan.id,
          billingCycle: billingCycle.value
        }
      });
      return;
    }

    const isFree = plan.price[billingCycle.value].price === 0;

    // 如果是免費方案，顯示確認對話框
    if (isFree) {
      const confirmed = confirm(t('subscription.confirm.downgrade'));
      if (!confirmed) return;

      // 免費方案直接更新
      await updateSubscription(plan.apiId, plan.price[billingCycle.value].id, billingCycle.value);
      alert(t('subscription.alert.change_success', { planName: plan.name }));
      return;
    }

    // 如果是付費方案，先確認訂閱並獲取 Paddle 配置

    // Paddle 本身也有 loading 的效果，所以先取消 isLoading
    // isLoading.value = true;

    try {
      // 獲取用戶 ID
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error(t('subscription.error.no_user'));
      }

      // 獲取 API 返回的 plan ID 和 price ID
      const apiPlanId = plan.apiId;
      const apiPriceId = getPlanApiPriceId(plan, billingCycle.value);

      if (!apiPlanId || !apiPriceId) {
        throw new Error(t('subscription.error.no_plan_info'));
      }

      // 先發送 POST 請求到 /v1/subscriptions 確認是否可以訂閱
      const confirmResponse = await api.subscription.confirmSubscription({
        planId: apiPlanId,
        priceId: apiPriceId,
        billingCycle: billingCycle.value,
      });

      // 保存確認訂閱的回傳結果
      pendingSubscriptionResponse.value = confirmResponse;

      // 檢查響應是否成功
      if (!confirmResponse || confirmResponse.error) {
        throw new Error(confirmResponse?.message || t('subscription.error.subscribe_failed'));
      }

      // 從響應中獲取 Paddle 配置
      const paddleConfig = confirmResponse.paddle || {};

      // 如果提供了新的 Paddle client_token，使用它初始化 Paddle
      if (paddleConfig.client_token) {
        await initPaddle({
          token: paddleConfig.client_token,
          environment: paddleConfig.environment,
        });
      } else {
        // 確保 Paddle 已初始化
        await initPaddle();
      }

      // 獲取 Paddle 實例
      const paddle = getPaddle();
      if (!paddle) {
        throw new Error(t('subscription.error.paddle_not_init'));
      }

      // 轉換 items 格式：從字符串數組轉換為 Paddle 需要的格式
      // API 返回: ["pri_01kaec721413e6j16a749xm9gj"]
      // Paddle 需要: [{ priceId: "pri_01kaec721413e6j16a749xm9gj", quantity: 1 }]
      const items = (confirmResponse.items || []).map((priceId) => ({
        priceId: priceId,
        quantity: 1,
      }));

      // 使用 API 返回的資料打開 Paddle 結帳視窗
      await paddle.Checkout.open({
        items: items,
        customer: confirmResponse.customer || {},
        customData: confirmResponse.customData || {},
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "zh-TW",
        },
      });
    } catch (checkoutError) {
      console.error("確認訂閱或打開結帳視窗失敗:", checkoutError);
      throw checkoutError;
    } finally {
      isLoading.value = false;
    }

  } catch (err) {
    console.error("更新方案失敗:", err);
    error.value = err.message || t('subscription.error.update_failed');
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }
};

// 初始化 Paddle
const initializePaddle = async () => {
  try {
    await initPaddle();
  } catch (err) {
    console.error("初始化 Paddle 失敗:", err);
    // 不阻止應用運行，只是付款功能無法使用
  }
};

// 檢查 URL 參數中的付款成功標記
const checkPaymentSuccess = async () => {
  if (route.query.success === "true") {
    // Check authentication first
    if (!authStore.isAuthenticated) {
      return;
    }

    // 從 URL 參數獲取方案信息
    const planId = route.query.planId;
    const priceId = route.query.priceId;
    const cycle = route.query.billingCycle || plansStore.billingCycle;

    if (planId) {
      try {
        await updateSubscription(planId, priceId, cycle);
        alert(t('subscription.alert.payment_success'));

        // 清除 URL 參數
        router.replace({ path: "/subscription", query: {} });

        // 刷新訂閱信息
        await plansStore.fetchCurrentSubscription();
        await plansStore.updateUsage();
      } catch (err) {
        console.error("更新訂閱失敗:", err);
        error.value = t('subscription.error.payment_success_update_failed');
      }
    }
  }
};

// 初始化
onMounted(async () => {
  await initialize();
  // 更新使用情況
  await plansStore.updateUsage();
  // 初始化 Paddle
  await initializePaddle();
  // 檢查付款成功
  await checkPaymentSuccess();
});

// 清理
onBeforeUnmount(() => {
  destroyPaddle();
});
</script>

<style scoped>
.subscription-page {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f5f7fa;
}

.subscription-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 20px 80px;
  position: relative;
}

.subscription-header {
  text-align: center;
  margin-bottom: 40px;
}

.subscription-header h1 {
  font-size: 2.625rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.25rem;
  color: #666;
}

.billing-toggle {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 12px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.toggle-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  color: #666;
}

.toggle-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.savings-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #10b981;
  color: white;
  font-size: 0.875rem;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 700;
}

.current-plan-info {
  margin-bottom: 40px;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.info-card h3 {
  font-size: 1.625rem;
  margin-bottom: 20px;
  font-weight: 600;
}

.usage-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.usage-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.usage-label {
  display: block;
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 8px;
}

.usage-value {
  display: block;
  font-size: 1.625rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.usage-bar {
  background: rgba(255, 255, 255, 0.2);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.usage-progress {
  background: white;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.usage-progress.limit-reached {
  background: #ef4444;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.plan-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 30px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #2563eb;
}

.plan-card.current {
  border-color: #10b981;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
}

.plan-card.recommended {
  border-color: #f59e0b;
}

.recommended-badge {
  position: absolute;
  top: -12px;
  right: 30px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.plan-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
}

.plan-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price-amount {
  font-size: 3.125rem;
  font-weight: 700;
  color: #2563eb;
}

.price-period {
  font-size: 1.25rem;
  color: #666;
}

.yearly-savings {
  margin-top: 8px;
  color: #10b981;
  font-weight: 600;
  font-size: 1rem;
}

.plan-limits {
  margin-bottom: 24px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.limit-item .icon {
  width: 20px;
  height: 20px;
  color: #2563eb;
  flex-shrink: 0;
}

.plan-features {
  margin-bottom: 30px;
  flex-grow: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: #4b5563;
}

.check-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
  flex-shrink: 0;
}

.subscribe-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.subscribe-btn.upgrade {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
}

.subscribe-btn.upgrade:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.subscribe-btn.current-plan {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.subscribe-btn.downgrade {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.subscribe-btn.downgrade:hover:not(:disabled) {
  background: #e5e7eb;
}

.comparison-section {
  margin-top: 60px;
}

.comparison-section h2 {
  font-size: 2.125rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  color: #1a1a1a;
}

.comparison-table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

th {
  padding: 20px;
  text-align: left;
  font-weight: 600;
  font-size: 1.25rem;
}

td {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #f9fafb;
}

.x-icon {
  width: 24px;
  height: 24px;
  color: #ef4444;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #fee2e2;
  color: #991b1b;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  z-index: 1001;
  animation: slideIn 0.3s ease;
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

.error-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #991b1b;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

@media (max-width: 768px) {
  .subscription-header h1 {
    font-size: 2rem;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .comparison-table {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }
}
</style>
