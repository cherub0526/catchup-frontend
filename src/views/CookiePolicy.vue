<template>
    <div class="policy-page">
        <AppHeader />
        <div class="policy-container">

            <div class="policy-header">
                <h1>Cookie 政策</h1>
                <p class="last-updated">最後更新日期：2025 年 11 月 24 日</p>
            </div>

            <div class="policy-content">
                <section>
                    <h2>1. 什麼是 Cookie？</h2>
                    <p>Cookie 是您訪問網站時存儲在您設備（電腦、平板電腦或手機）上的小型文本文件。它們廣泛用於使網站正常運行或更高效地運行，以及向網站所有者提供報告資訊。</p>
                </section>

                <section>
                    <h2>2. 我們如何使用 Cookie</h2>
                    <p>CatchUp 使用 Cookie 來改善您的瀏覽體驗。我們主要使用以下類型的 Cookie：</p>
                    <ul>
                        <li><strong>必要 Cookie：</strong>這些 Cookie 對於網站的運作至關重要，例如允許您登入安全區域。</li>
                        <li><strong>功能性 Cookie：</strong>這些 Cookie 允許網站記住您所做的選擇（例如您的使用者名稱、語言或地區），並提供增強的個人化功能。</li>
                        <li><strong>分析/效能 Cookie：</strong>這些 Cookie 允許我們識別和計算訪客數量，並了解訪客在使用網站時的移動方式。這有助於我們改進網站的工作方式。</li>
                    </ul>
                </section>

                <section>
                    <h2>3. 第三方 Cookie</h2>
                    <p>除了我們自己的 Cookie 外，我們還可能使用各種第三方 Cookie 來報告網站的使用統計數據，並在網站上和通過網站提供廣告。</p>
                </section>

                <section>
                    <h2>4. 您的選擇</h2>
                    <p>大多數網頁瀏覽器會自動接受 Cookie，但您通常可以修改瀏覽器設置以拒絕 Cookie。請注意，如果您選擇拒絕 Cookie，您可能無法完全體驗本服務的某些功能。</p>
                    <p>您可以通過瀏覽器的設置選單來管理您的 Cookie 偏好。有關如何執行此操作的更多資訊，請參閱您瀏覽器的「幫助」部分。</p>
                </section>

                <section>
                    <h2>5. 政策變更</h2>
                    <p>我們可能會不時更新本 Cookie 政策。我們鼓勵您定期查看本頁面以獲取有關我們使用 Cookie 的最新資訊。</p>
                </section>

                <section>
                    <h2>6. 聯絡我們</h2>
                    <p>如果您對我們的 Cookie 政策有任何疑問，請聯繫我們。</p>
                </section>
            </div>
        </div>
        <AppFooter />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const router = useRouter();


</script>

<style scoped>
.policy-page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    background: #f5f7fa;
}

.policy-container {
    flex: 1 0 auto;
    max-width: 1200px;
    margin: 0 auto;
    padding: 120px 20px 80px;
}

.policy-header {
    text-align: center;
    margin-bottom: 40px;
}

.policy-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 10px;
}

.last-updated {
    font-size: 0.875rem;
    color: #666;
}

.policy-content {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

section {
    margin-bottom: 30px;
}

h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
}

p {
    color: #4b5563;
    line-height: 1.7;
    margin-bottom: 16px;
}

ul {
    list-style-type: disc;
    padding-left: 24px;
    color: #4b5563;
    line-height: 1.7;
}

li {
    margin-bottom: 8px;
}

strong {
    color: #374151;
}
</style>
