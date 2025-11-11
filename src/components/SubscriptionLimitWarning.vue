<template>
  <div v-if="shouldShowWarning" class="limit-warning">
    <div class="warning-content">
      <font-awesome-icon icon="exclamation-triangle" class="warning-icon" />

      <div class="warning-text">
        <h4>{{ warningTitle }}</h4>
        <p>{{ warningMessage }}</p>
      </div>

      <router-link to="/subscription" class="upgrade-btn"> 升級方案 </router-link>

      <!-- <button @click="dismiss" class="dismiss-btn">×</button> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { usePlansStore } from "@/stores/plans";
import { storeToRefs } from "pinia";

const props = defineProps({
  type: {
    type: String,
    default: "both", // 'channel', 'media', or 'both'
  },
  showAlways: {
    type: Boolean,
    default: false,
  },
});

const plansStore = usePlansStore();
const { usage, currentLimits, isChannelLimitReached, isMediaLimitReached } = storeToRefs(plansStore);

const isDismissed = ref(false);

const shouldShowWarning = computed(() => {
  if (isDismissed.value && !props.showAlways) return false;

  if (props.type === "channel") {
    return isChannelLimitReached.value;
  } else if (props.type === "media") {
    return isMediaLimitReached.value;
  } else {
    return isChannelLimitReached.value || isMediaLimitReached.value;
  }
});

const warningTitle = computed(() => {
  if (isChannelLimitReached.value && isMediaLimitReached.value) {
    return "已達到訂閱限制";
  } else if (isChannelLimitReached.value) {
    return "已達到頻道訂閱上限";
  } else if (isMediaLimitReached.value) {
    return "已達到影音數量上限";
  }
  return "";
});

const warningMessage = computed(() => {
  const messages = [];

  if (isChannelLimitReached.value) {
    messages.push(`頻道訂閱數：${usage.value.channels}/${currentLimits.value.channels}`);
  }

  if (isMediaLimitReached.value) {
    messages.push(`影音數量：${usage.value.media}/${currentLimits.value.media}`);
  }

  return messages.join(" | ") + "。升級方案以獲得更多容量。";
});

const dismiss = () => {
  isDismissed.value = true;
};

// 當限制狀態改變時，重置 dismiss 狀態
watch([isChannelLimitReached, isMediaLimitReached], () => {
  isDismissed.value = false;
});
</script>

<style scoped>
.limit-warning {
  margin-bottom: 20px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warning-content {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
  position: relative;
}

.warning-icon {
  width: 32px;
  height: 32px;
  color: #f59e0b;
  flex-shrink: 0;
}

.warning-text {
  flex-grow: 1;
}

.warning-text h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #854d0e;
  margin: 0 0 4px 0;
}

.warning-text p {
  font-size: 0.875rem;
  color: #92400e;
  margin: 0;
}

.upgrade-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.dismiss-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #92400e;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.dismiss-btn:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .warning-content {
    flex-wrap: wrap;
    padding: 16px;
  }

  .warning-text {
    width: 100%;
    margin-bottom: 8px;
  }

  .upgrade-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
