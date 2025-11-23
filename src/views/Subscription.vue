<template>
  <div class="subscription-page">
    <div class="subscription-container">
      <!-- 返回按鈕 -->
      <button class="back-btn" @click="goBack">
        <font-awesome-icon icon="arrow-left" />
        <span>返回</span>
      </button>

      <div class="subscription-header">
        <h1>訂閱方案</h1>
        <p class="subtitle">選擇最適合您的方案</p>
      </div>

      <!-- 計費週期切換 -->
      <div class="billing-toggle">
        <button :class="['toggle-btn', { active: billingCycle === 'monthly' }]" @click="billingCycle = 'monthly'">
          月付
        </button>
        <button :class="['toggle-btn', { active: billingCycle === 'annually' }]" @click="billingCycle = 'annually'">
          年付
          <span class="savings-badge">省 20%</span>
        </button>
      </div>

      <!-- 當前使用情況 -->
      <div v-if="currentPlan" class="current-plan-info">
        <div class="info-card">
          <h3>您目前的方案：{{ currentPlan.name }}</h3>
          <div class="usage-stats">
            <div class="usage-item">
              <span class="usage-label">訂閱頻道</span>
              <span class="usage-value">{{ usage.channels }} / {{ currentLimits.channels }}</span>
              <div class="usage-bar">
                <div
                  class="usage-progress"
                  :style="{ width: `${(usage.channels / currentLimits.channels) * 100}%` }"
                  :class="{ 'limit-reached': isChannelLimitReached }"></div>
              </div>
            </div>
            <div class="usage-item">
              <span class="usage-label">影音數量</span>
              <span class="usage-value">{{ usage.media }} / {{ currentLimits.media }}</span>
              <div class="usage-bar">
                <div
                  class="usage-progress"
                  :style="{ width: `${(usage.media / currentLimits.media) * 100}%` }"
                  :class="{ 'limit-reached': isMediaLimitReached }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案列表 -->
      <div class="plans-grid">
        <div
          v-for="plan in allPlans"
          :key="plan.id"
          :class="[
            'plan-card',
            {
              current: isCurrentPlan(plan),
              recommended: plan.id === 'basic',
            },
          ]">
          <div v-if="plan.id === 'basic'" class="recommended-badge">推薦</div>

          <div class="plan-header">
            <h2 class="plan-name">{{ plan.name }}</h2>
            <div class="plan-price">
              <span class="price-amount">${{ getPlanPrice(plan, billingCycle) }}</span>
              <span class="price-period">/ {{ billingCycle === "monthly" ? "月" : "年" }}</span>
            </div>
            <div v-if="billingCycle === 'annually' && plan.price.monthly?.price > 0" class="yearly-savings">
              每年節省 ${{ getYearlySavings(plan) }}
            </div>
          </div>

          <div class="plan-limits">
            <div class="limit-item">
              <font-awesome-icon icon="users" class="icon" />
              <span>最多 {{ plan.limits.channels }} 個訂閱頻道</span>
            </div>
            <div class="limit-item">
              <font-awesome-icon icon="video" class="icon" />
              <span>最多 {{ plan.limits.media }} 隻影音</span>
            </div>
          </div>

          <div class="plan-features">
            <div v-for="(feature, index) in plan.features" :key="index" class="feature-item">
              <font-awesome-icon icon="check" class="check-icon" />
              <span>{{ feature }}</span>
            </div>
          </div>

          <button
            :class="[
              'subscribe-btn',
              {
                'current-plan': isCurrentPlan(plan),
                upgrade: !isCurrentPlan(plan) && getPlanValue(currentPlan) < getPlanValue(plan),
                downgrade: !isCurrentPlan(plan) && getPlanValue(currentPlan) > getPlanValue(plan),
              },
            ]"
            @click="handlePlanChange(plan)"
            :disabled="isLoading || isCurrentPlan(plan)">
            <span v-if="isCurrentPlan(plan)">目前方案</span>
            <span v-else-if="!currentPlan || getPlanValue(currentPlan) < getPlanValue(plan)">升級</span>
            <span v-else-if="getPlanValue(currentPlan) > getPlanValue(plan)">降級</span>
          </button>
        </div>
      </div>

      <!-- 方案比較表 -->
      <div class="comparison-section">
        <h2>方案比較</h2>
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>功能</th>
                <th v-for="plan in allPlans" :key="plan.id">{{ plan.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>訂閱頻道</td>
                <td v-for="plan in allPlans" :key="plan.id">{{ plan.limits.channels }} 個</td>
              </tr>
              <tr>
                <td>影音數量</td>
                <td v-for="plan in allPlans" :key="plan.id">{{ plan.limits.media }} 隻</td>
              </tr>
              <tr>
                <td>優先客服支援</td>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePlansStore } from "@/stores/plans";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { initPaddle, openSubscriptionCheckout, setupPaddleListeners, destroyPaddle, getPaddle } from "@/utils/paddle";
import api from "@/api";

const router = useRouter();
const route = useRoute();
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

// 獲取方案的數值（用於比較）
const getPlanValue = (plan) => {
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
    // 如果是免費方案，顯示確認對話框
    if (currentPlan.value && currentPlan.value.id !== "free" && plan.id === "free") {
      const confirmed = confirm("確定要降級到免費方案嗎？您將失去目前的訂閱功能。");
      if (!confirmed) return;

      // 直接更新到免費方案
      await updateSubscription(plan.id, billingCycle.value);
      alert(`成功變更到 ${plan.name} 方案！`);
      return;
    }

    // 如果是付費方案，先確認訂閱並獲取 Paddle 配置
    if (plan.id !== "free") {
      isLoading.value = true;

      try {
        // 獲取用戶 ID
        const userId = authStore.user?.id;
        if (!userId) {
          throw new Error("無法獲取用戶信息，請先登入");
        }

        // 獲取 API 返回的 plan ID 和 price ID
        const apiPlanId = plan.apiId;
        const apiPriceId = getPlanApiPriceId(plan, billingCycle.value);

        if (!apiPlanId || !apiPriceId) {
          throw new Error("無法獲取方案信息，請稍後再試");
        }

        // 先發送 POST 請求到 /v1/subscriptions 確認是否可以訂閱
        const confirmResponse = await api.subscription.confirmSubscription({
          planId: apiPlanId,
          priceId: apiPriceId,
          billingCycle: billingCycle.value,
        });

        // 檢查響應是否成功
        if (!confirmResponse || confirmResponse.error) {
          throw new Error(confirmResponse?.message || "無法訂閱此方案，請稍後再試");
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
          throw new Error("Paddle 尚未初始化，無法進行結帳");
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
    } else {
      // 免費方案直接更新
      await updateSubscription(plan.id, billingCycle.value);
      alert(`成功變更到 ${plan.name} 方案！`);
    }
  } catch (err) {
    console.error("更新方案失敗:", err);
    error.value = err.message || "更新方案失敗，請稍後再試";
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }
};

// 返回上一頁
const goBack = () => {
  router.back();
};

// 初始化 Paddle
const initializePaddle = async () => {
  try {
    await initPaddle();

    // 設置 Paddle 事件監聽器
    setupPaddleListeners({
      onCheckoutCompleted: async (data) => {
        console.log("Paddle 結帳完成:", data);

        // 從 customData 獲取方案信息
        const customData = data.customData || {};
        const planId = customData.planId || route.query.planId;

        if (planId) {
          try {
            // 更新訂閱方案（使用當前的 billingCycle）
            await updateSubscription(planId, billingCycle.value);
            alert(
              `付款成功！已成功${getPlanValue({ id: planId }) > getPlanValue(currentPlan.value) ? "升級" : "變更"}到方案！`
            );

            // 刷新訂閱信息
            await plansStore.fetchCurrentSubscription();
            await plansStore.updateUsage();
          } catch (err) {
            console.error("更新訂閱失敗:", err);
            error.value = "付款成功，但更新訂閱失敗，請聯繫客服";
          }
        }
      },
      onCheckoutClosed: (data) => {
        console.log("Paddle 結帳視窗關閉:", data);
        isLoading.value = false;
      },
      onError: (err) => {
        console.error("Paddle 結帳錯誤:", err);
        error.value = err.message || "付款過程中發生錯誤";
        isLoading.value = false;
      },
    });
  } catch (err) {
    console.error("初始化 Paddle 失敗:", err);
    // 不阻止應用運行，只是付款功能無法使用
  }
};

// 檢查 URL 參數中的付款成功標記
const checkPaymentSuccess = async () => {
  if (route.query.success === "true") {
    // 從 URL 參數獲取方案信息
    const planId = route.query.planId;
    const cycle = route.query.billingCycle || plansStore.billingCycle;

    if (planId) {
      try {
        await updateSubscription(planId, cycle);
        alert("付款成功！訂閱已更新。");

        // 清除 URL 參數
        router.replace({ path: "/subscription", query: {} });

        // 刷新訂閱信息
        await plansStore.fetchCurrentSubscription();
        await plansStore.updateUsage();
      } catch (err) {
        console.error("更新訂閱失敗:", err);
        error.value = "付款成功，但更新訂閱失敗，請聯繫客服";
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
  padding: 40px 20px 80px;
  position: relative;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.back-btn:hover {
  background: #f9fafb;
  border-color: #2563eb;
  color: #2563eb;
  transform: translateX(-4px);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

.subscription-header {
  text-align: center;
  margin-bottom: 40px;
}

.subscription-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.125rem;
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
  font-size: 1rem;
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
  font-size: 0.75rem;
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
  font-size: 1.5rem;
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
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 8px;
}

.usage-value {
  display: block;
  font-size: 1.5rem;
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
  font-size: 0.875rem;
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
  font-size: 1.875rem;
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
  font-size: 3rem;
  font-weight: 700;
  color: #2563eb;
}

.price-period {
  font-size: 1.125rem;
  color: #666;
}

.yearly-savings {
  margin-top: 8px;
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
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
  font-size: 1.125rem;
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
  font-size: 2rem;
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
  font-size: 1.125rem;
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
