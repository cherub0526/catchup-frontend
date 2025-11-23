<template>
    <div class="faq-page">
        <AppHeader />
        <div class="faq-container">

            <div class="faq-header">
                <h1>常見問題</h1>
                <p class="subtitle">這裡收集了大家最常問的問題</p>
            </div>

            <div class="faq-content">
                <div class="faq-item" v-for="(item, index) in faqItems" :key="index">
                    <div class="faq-question" @click="toggleItem(index)">
                        <h3>{{ item.question }}</h3>
                        <font-awesome-icon :icon="item.isOpen ? 'chevron-down' : 'chevron-right'" class="toggle-icon" />
                    </div>
                    <transition name="slide-fade">
                        <div v-if="item.isOpen" class="faq-answer">
                            <p v-html="item.answer"></p>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
        <AppFooter />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const router = useRouter();

const faqItems = ref([
    {
        question: '如何訂閱服務？',
        answer: '您可以前往 <a href="/subscription" class="link">訂閱頁面</a> 選擇適合您的方案。我們提供月付和年付兩種選擇，年付方案更可享有 20% 的折扣優惠！',
        isOpen: true
    },
    {
        question: '如何登入我的帳號？',
        answer: '請點擊 <a href="/login" class="link">登入頁面</a> 輸入您的電子郵件和密碼即可登入。如果您還沒有帳號，也可以在該頁面進行註冊。',
        isOpen: false
    },
    {
        question: '忘記密碼怎麼辦？',
        answer: '在 <a href="/login" class="link">登入頁面</a> 中，點擊「忘記密碼」連結，輸入您的註冊信箱，系統將會發送重設密碼的連結給您。',
        isOpen: false
    },
    {
        question: '如何取消訂閱？',
        answer: '您可以隨時在 <a href="/subscription" class="link">訂閱管理</a> 頁面查看或變更您的訂閱狀態。如果您需要取消訂閱，請聯繫我們的客服團隊。',
        isOpen: false
    },
    {
        question: 'CatchUp 是什麼？',
        answer: 'CatchUp 是一個智能助理，能夠自動化總結您訂閱的頻道內容，幫助您快速掌握最新資訊，節省寶貴的時間。',
        isOpen: false
    }
]);

const toggleItem = (index) => {
    faqItems.value[index].isOpen = !faqItems.value[index].isOpen;
};
</script>

<style scoped>
.faq-page {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    background: #f5f7fa;
}

.faq-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 120px 20px 80px;
}

.faq-header {
    text-align: center;
    margin-bottom: 40px;
}

.faq-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 10px;
}

.subtitle {
    font-size: 1.125rem;
    color: #666;
}

.faq-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.faq-item {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.faq-item:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.faq-question {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    background: white;
}

.faq-question h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.toggle-icon {
    color: #9ca3af;
    transition: transform 0.3s ease;
}

.faq-answer {
    padding: 0 24px 24px;
    color: #4b5563;
    line-height: 1.6;
}

/* Deep selector for v-html content */
:deep(.link) {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

:deep(.link):hover {
    color: #1d4ed8;
    text-decoration: underline;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease-out;
    max-height: 500px;
    opacity: 1;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    padding-bottom: 0;
}
</style>
