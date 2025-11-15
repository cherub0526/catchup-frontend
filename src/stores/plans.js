import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";

// 將 API 返回的方案資料轉換為應用程式格式
const transformPlanFromAPI = (apiPlan) => {
  const planId = apiPlan.title.toLowerCase();
  
  // 轉換價格格式
  const price = {
    monthly: null,
    yearly: null,
  };
  
  apiPlan.prices.forEach((p) => {
    if (p.unit === "monthly") {
      price.monthly = {
        id: p.id,
        price: p.price,
      };
    } else if (p.unit === "yearly") {
      price.yearly = {
        id: p.id,
        price: p.price,
      };
    }
  });

  // 生成功能列表
  const features = [];
  if (apiPlan.channel_limit > 0) {
    features.push(`最多 ${apiPlan.channel_limit} 個訂閱頻道`);
  }
  if (apiPlan.video_limit > 0) {
    features.push(`最多 ${apiPlan.video_limit} 隻影音`);
  }
  if (apiPlan.chat_limit > 0) {
    features.push(`最多 ${apiPlan.chat_limit} 次聊天`);
  }
  if (planId === "advance") {
    features.push("優先客服支援", "進階分析功能");
  }
  if (planId === "free") {
    features.push("基本播放功能");
  }

  return {
    id: planId,
    apiId: apiPlan.id, // 保留原始 API ID 用於後續請求
    name: apiPlan.title,
    description: apiPlan.description || "",
    price: price,
    limits: {
      channels: apiPlan.channel_limit,
      media: apiPlan.video_limit,
      chat: apiPlan.chat_limit,
    },
    features: features,
  };
};

export const usePlansStore = defineStore("plans", () => {
  const currentPlan = ref(null);
  const billingCycle = ref("monthly"); // 'monthly' or 'yearly'
  const isLoading = ref(false);
  const error = ref(null);

  // 方案列表（從 API 獲取）
  const plans = ref([]);

  // 使用情況統計
  const usage = ref({
    channels: 0,
    media: 0,
  });

  // 獲取所有方案（從 API）
  const allPlans = computed(() => plans.value);

  // 根據 ID 獲取方案
  const getPlanById = (id) => {
    return plans.value.find((plan) => plan.id === id || plan.apiId === id);
  };

  // 當前方案的限制
  const currentLimits = computed(() => {
    if (!currentPlan.value) {
      // 如果沒有當前方案，返回免費方案的預設限制
      const freePlan = plans.value.find((p) => p.id === "free");
      return freePlan?.limits || { channels: 1, media: 3, chat: 0 };
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

  // 獲取所有方案（從 API）
  const fetchPlans = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.getPlans();

      if (response.data && Array.isArray(response.data)) {
        // 轉換 API 返回的方案資料
        plans.value = response.data.map(transformPlanFromAPI);
      } else {
        console.warn("API 返回的方案資料格式不正確");
        plans.value = [];
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取方案列表失敗";
      console.error("獲取方案列表失敗:", err);
      plans.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 獲取當前訂閱信息
  const fetchCurrentSubscription = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.subscription.getCurrentSubscription();

      if (response.data) {
        const planId = response.data.planId || response.data.plan_id || "free";
        // 從方案列表中查找對應的方案
        currentPlan.value = getPlanById(planId) || plans.value.find((p) => p.id === "free");
        billingCycle.value = response.data.billingCycle || response.data.billing_cycle || "monthly";

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
        currentPlan.value = plans.value.find((p) => p.id === "free");
      }

      return response;
    } catch (err) {
      error.value = err.message || "獲取訂閱信息失敗";
      console.error("獲取訂閱信息失敗:", err);
      // 如果失敗，默認使用免費方案
      currentPlan.value = plans.value.find((p) => p.id === "free");
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
      currentPlan.value = plans.value.find((p) => p.id === "free");
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
    const priceObj = plan.price[currentCycle];
    return priceObj ? priceObj.price : 0;
  };

  // 獲取方案的價格 ID（用於 Paddle）
  const getPlanPriceId = (plan, cycle = null) => {
    const currentCycle = cycle || billingCycle.value;
    const priceObj = plan.price[currentCycle];
    return priceObj ? priceObj.id : null;
  };

  // 計算年費節省金額
  const getYearlySavings = (plan) => {
    const monthlyPrice = plan.price.monthly?.price || 0;
    const yearlyPrice = plan.price.yearly?.price || 0;
    const monthlyTotal = monthlyPrice * 12;
    const yearlySaving = monthlyTotal - yearlyPrice;
    return yearlySaving;
  };

  // 初始化
  const initialize = async () => {
    // 先獲取方案列表
    await fetchPlans();
    // 然後獲取當前訂閱信息
    await fetchCurrentSubscription();
  };

  return {
    currentPlan,
    billingCycle,
    isLoading,
    error,
    usage,
    plans,
    allPlans,
    currentLimits,
    isChannelLimitReached,
    isMediaLimitReached,
    fetchPlans,
    fetchCurrentSubscription,
    updateSubscription,
    cancelSubscription,
    updateUsage,
    canAddChannel,
    canAddMedia,
    getPlanById,
    getPlanPrice,
    getPlanPriceId,
    getYearlySavings,
    initialize,
  };
});
