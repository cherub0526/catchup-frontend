<template>
    <div class="policy-page">
        <AppHeader />
        <div class="policy-container">

            <div class="policy-header">
                <h1>隱私權政策</h1>
                <p class="last-updated">最後更新日期：2025 年 11 月 24 日</p>
            </div>

            <div class="policy-content">
                <section>
                    <h2>1. 引言</h2>
                    <p>歡迎使用 CatchUp（以下簡稱「本服務」）。我們非常重視您的隱私權，並致力於保護您的個人資料。本隱私權政策旨在說明我們如何收集、使用、披露和保護您的資訊。</p>
                </section>

                <section>
                    <h2>2. 我們收集的資訊</h2>
                    <p>我們可能會收集以下類型的資訊：</p>
                    <ul>
                        <li><strong>帳戶資訊：</strong>當您註冊帳戶時，我們會收集您的電子郵件地址、使用者名稱和密碼。</li>
                        <li><strong>使用數據：</strong>我們會收集您與本服務互動的資訊，例如您訂閱的頻道、觀看的摘要以及使用本服務的時間和頻率。</li>
                        <li><strong>設備資訊：</strong>我們會收集有關您用於訪問本服務的設備的資訊，例如 IP 地址、瀏覽器類型和操作系統。</li>
                    </ul>
                </section>

                <section>
                    <h2>3. 我們如何使用您的資訊</h2>
                    <p>我們將收集的資訊用於以下目的：</p>
                    <ul>
                        <li>提供、維護和改善本服務。</li>
                        <li>處理您的交易並管理您的訂閱。</li>
                        <li>向您發送技術通知、更新、安全警報和支持訊息。</li>
                        <li>回應您的評論、問題和請求，並提供客戶服務。</li>
                        <li>分析趨勢和使用情況，以優化使用者體驗。</li>
                    </ul>
                </section>

                <section>
                    <h2>4. 資訊分享與披露</h2>
                    <p>除非經您同意或法律規定，我們不會將您的個人資料分享給第三方。但在以下情況下，我們可能會分享您的資訊：</p>
                    <ul>
                        <li><strong>服務提供商：</strong>我們可能會與協助我們營運本服務的第三方服務提供商分享資訊（例如支付處理、數據分析）。</li>
                        <li><strong>法律要求：</strong>如果我們認為披露是為了遵守法律、法規或法律程序所必需的，我們可能會披露您的資訊。</li>
                    </ul>
                </section>

                <section>
                    <h2>5. 數據安全</h2>
                    <p>我們採取合理的措施來保護您的資訊免受丟失、盜竊、濫用和未經授權的訪問、披露、更改和破壞。然而，請注意，沒有任何網路傳輸或電子存儲方法是 100% 安全的。</p>
                </section>

                <section>
                    <h2>6. 您的權利</h2>
                    <p>您有權訪問、更正或刪除您的個人資料。您可以通過登入您的帳戶設置或聯繫我們來行使這些權利。</p>
                </section>

                <section>
                    <h2>7. 政策變更</h2>
                    <p>我們可能會不時更新本隱私權政策。如果我們進行重大變更，我們將通過電子郵件或在本服務上發布通知來通知您。</p>
                </section>

                <section>
                    <h2>8. 聯絡我們</h2>
                    <p>如果您對本隱私權政策有任何疑問，請聯繫我們。</p>
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
    overflow-y: auto;
    overflow-x: hidden;
    background: #f5f7fa;
}

.policy-container {
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
