<template>
  <div class="subscription-status">
    <div class="status-header">
      <div class="plan-badge" :class="planBadgeClass">
        {{ currentPlan?.name || 'Free' }}
      </div>
      <router-link to="/subscription" class="manage-link">
        管理方案
      </router-link>
    </div>
    
    <div class="usage-grid">
      <div class="usage-card">
        <div class="usage-header">
          <svg class="usage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="usage-label">訂閱頻道</span>
        </div>
        <div class="usage-stats">
          <span class="usage-current">{{ usage.channels }}</span>
          <span class="usage-separator">/</span>
          <span class="usage-limit">{{ currentLimits.channels }}</span>
        </div>
        <div class="usage-bar">
          <div 
            class="usage-fill" 
            :class="{ 'near-limit': channelUsagePercentage >= 80, 'at-limit': isChannelLimitReached }"
            :style="{ width: `${Math.min(channelUsagePercentage, 100)}%` }"
          ></div>
        </div>
      </div>
      
      <div class="usage-card">
        <div class="usage-header">
          <svg class="usage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="23 7 16 12 23 17 23 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="usage-label">影音數量</span>
        </div>
        <div class="usage-stats">
          <span class="usage-current">{{ usage.videos }}</span>
          <span class="usage-separator">/</span>
          <span class="usage-limit">{{ currentLimits.videos }}</span>
        </div>
        <div class="usage-bar">
          <div 
            class="usage-fill" 
            :class="{ 'near-limit': videoUsagePercentage >= 80, 'at-limit': isVideoLimitReached }"
            :style="{ width: `${Math.min(videoUsagePercentage, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePlansStore } from '@/stores/plans';
import { storeToRefs } from 'pinia';

const plansStore = usePlansStore();
const { 
  currentPlan, 
  usage, 
  currentLimits, 
  isChannelLimitReached, 
  isVideoLimitReached 
} = storeToRefs(plansStore);

const planBadgeClass = computed(() => {
  const planId = currentPlan.value?.id || 'free';
  return `plan-${planId}`;
});

const channelUsagePercentage = computed(() => {
  if (currentLimits.value.channels === 0) return 0;
  return (usage.value.channels / currentLimits.value.channels) * 100;
});

const videoUsagePercentage = computed(() => {
  if (currentLimits.value.videos === 0) return 0;
  return (usage.value.videos / currentLimits.value.videos) * 100;
});
</script>

<style scoped>
.subscription-status {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plan-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-badge.plan-free {
  background: #e5e7eb;
  color: #6b7280;
}

.plan-badge.plan-basic {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.plan-badge.plan-advance {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.manage-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.manage-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.usage-grid {
  display: grid;
  gap: 16px;
}

.usage-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.usage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.usage-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.usage-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.usage-stats {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.usage-current {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.usage-separator {
  font-size: 1.25rem;
  color: #9ca3af;
}

.usage-limit {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 600;
}

.usage-bar {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.usage-fill.near-limit {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.usage-fill.at-limit {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

@media (min-width: 768px) {
  .usage-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

