import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";

// 定義訂閱方案
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      channels: 1,
      media: 3,
    },
    features: ["最多 1 個訂閱頻道", "最多 3 隻影音", "基本播放功能"],
  },
  BASIC: {
    id: "basic",
    name: "Basic",
    price: {
      monthly: 5,
      yearly: 48, // 5 * 12 * 0.8 = 48
    },
    limits: {
      channels: 3,
      media: 50,
    },
    features: ["最多 3 個訂閱頻道", "最多 50 隻影音"],
  },
  ADVANCE: {
    id: "advance",
    name: "Advance",
    price: {
      monthly: 10,
      yearly: 96, // 10 * 12 * 0.8 = 96
    },
    limits: {
      channels: 10,
      media: 100,
    },
    features: ["最多 10 個訂閱頻道", "最多 100 隻影音", "優先客服支援", "進階分析功能"],
  },
};

export const usePlansStore = defineStore("plans", () => {
  const currentPlan = ref(null);
  const billingCycle = ref("monthly"); // 'monthly' or 'yearly'
  const isLoading = ref(false);
  const error = ref(null);

  // 使用情況統計
  const usage = ref({
    channels: 0,
    media: 0,
  });

  // 獲取所有方案
  const allPlans = computed(() => Object.values(SUBSCRIPTION_PLANS));

  // 當前方案的限制
  const currentLimits = computed(() => {
    if (!currentPlan.value) {
      return SUBSCRIPTION_PLANS.FREE.limits;
    }
    return currentPlan.value.limits;
  });

  // 檢查是否達到限制
  const isChannelLimitReached = computed(() => {
    return usage.value.channels >= currentLimits.value.channels;
  });

  const isMediaLimitReached = computed(() => {
    return usage.value.media >= currentLimits.value.media;
  });

  // 獲取當前訂閱信息
  const fetchCurrentSubscription = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.getCurrentSubscription();

      if (response.data) {
        const planId = response.data.planId || "free";
        currentPlan.value = SUBSCRIPTION_PLANS[planId.toUpperCase()] || SUBSCRIPTION_PLANS.FREE;
        billingCycle.value = response.data.billingCycle || "monthly";

        // 如果 API 返回了 plan 限制，使用 API 的值更新當前方案限制
        if (response.data.plan) {
          currentPlan.value = {
            ...currentPlan.value,
            limits: response.data.plan,
          };
        }

        // 更新使用情況
        if (response.data.usage) {
          usage.value = response.data.usage;
        }
      } else {
        // 默認為免費方案
        currentPlan.value = SUBSCRIPTION_PLANS.FREE;
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取訂閱信息失敗";
      console.error("獲取訂閱信息失敗:", err);
      // 如果失敗，默認使用免費方案
      currentPlan.value = SUBSCRIPTION_PLANS.FREE;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新訂閱方案
  const updateSubscription = async (planId, cycle = "monthly") => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.updateSubscription({
        planId,
        billingCycle: cycle,
      });

      // 更新成功後重新獲取當前訂閱和使用情況
      await fetchCurrentSubscription();
      await updateUsage();

      return response;
    } catch (err) {
      error.value = err.message || "更新訂閱方案失敗";
      console.error("更新訂閱方案失敗:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 取消訂閱
  const cancelSubscription = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.cancelSubscription();

      // 取消後回到免費方案
      currentPlan.value = SUBSCRIPTION_PLANS.FREE;
      billingCycle.value = "monthly";

      // 更新使用情況
      await updateUsage();

      return response;
    } catch (err) {
      error.value = err.message || "取消訂閱失敗";
      console.error("取消訂閱失敗:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新使用情況
  const updateUsage = async () => {
    try {
      const response = await api.subscription.getUsage();

      if (response) {
        // API 返回結構: { plan: {channels, media}, usage: {channels, media} }
        if (response.data.usage) {
          usage.value = response.data.usage;
        }

        console.log(response);
        // 如果 API 也返回了 plan limits，可以更新當前方案的限制
        if (response.data.plan && currentPlan.value) {
          currentPlan.value.limits = response.data.plan;
        }
      }

      return response;
    } catch (err) {
      console.error("更新使用情況失敗:", err);
      throw err;
    }
  };

  // 檢查是否可以添加頻道
  const canAddChannel = () => {
    return !isChannelLimitReached.value;
  };

  // 檢查是否可以添加影音
  const canAddMedia = () => {
    return !isMediaLimitReached.value;
  };

  // 計算方案價格（根據計費週期）
  const getPlanPrice = (plan, cycle = null) => {
    const currentCycle = cycle || billingCycle.value;
    return plan.price[currentCycle];
  };

  // 計算年費節省金額
  const getYearlySavings = (plan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const yearlySaving = monthlyTotal - plan.price.yearly;
    return yearlySaving;
  };

  // 初始化
  const initialize = async () => {
    await fetchCurrentSubscription();
  };

  return {
    currentPlan,
    billingCycle,
    isLoading,
    error,
    usage,
    allPlans,
    currentLimits,
    isChannelLimitReached,
    isMediaLimitReached,
    fetchCurrentSubscription,
    updateSubscription,
    cancelSubscription,
    updateUsage,
    canAddChannel,
    canAddMedia,
    getPlanPrice,
    getYearlySavings,
    initialize,
    SUBSCRIPTION_PLANS,
  };
});
