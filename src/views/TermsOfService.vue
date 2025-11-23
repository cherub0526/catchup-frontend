<template>
    <div class="policy-page">
        <AppHeader />
        <div class="policy-container">

            <div class="policy-header">
                <h1>服務條款</h1>
                <p class="last-updated">最後更新日期：2025 年 11 月 24 日</p>
            </div>

            <div class="policy-content">
                <section>
                    <h2>1. 接受條款</h2>
                    <p>歡迎使用 CatchUp。通過訪問或使用本服務，即表示您同意受本服務條款（以下簡稱「本條款」）的約束。如果您不同意本條款的任何部分，則不得使用本服務。</p>
                </section>

                <section>
                    <h2>2. 服務說明</h2>
                    <p>CatchUp 提供自動化總結訂閱頻道內容的智能助理服務。我們保留隨時修改、暫停或終止本服務（或其任何部分）的權利，恕不另行通知。</p>
                </section>

                <section>
                    <h2>3. 使用者帳戶</h2>
                    <p>為了使用本服務的某些功能，您可能需要註冊一個帳戶。您同意提供準確、完整和最新的註冊資訊。您有責任維護您帳戶密碼的機密性，並對發生在您帳戶下的所有活動負責。</p>
                </section>

                <section>
                    <h2>4. 使用限制</h2>
                    <p>您同意不從事以下行為：</p>
                    <ul>
                        <li>違反任何適用的法律或法規。</li>
                        <li>侵犯他人的知識產權或其他權利。</li>
                        <li>傳播任何有害、威脅、辱罵、騷擾、誹謗或令人反感的內容。</li>
                        <li>干擾或破壞本服務的安全性或完整性。</li>
                        <li>使用自動化工具（如機器人）訪問本服務，除非經我們明確允許。</li>
                    </ul>
                </section>

                <section>
                    <h2>5. 訂閱與付款</h2>
                    <p>本服務的某些部分可能需要付費訂閱。您同意支付與您的訂閱相關的所有費用。所有費用均不退還，除非法律另有規定或我們另有說明。</p>
                </section>

                <section>
                    <h2>6. 知識產權</h2>
                    <p>本服務及其原始內容、功能和功能是 CatchUp 及其許可方的專有財產，受版權、商標和其他知識產權法的保護。</p>
                </section>

                <section>
                    <h2>7. 免責聲明</h2>
                    <p>本服務按「原樣」和「可用」的基礎提供。我們不對本服務的運作或其中包含的資訊、內容或材料作任何形式的明示或暗示的陳述或保證。</p>
                </section>

                <section>
                    <h2>8. 責任限制</h2>
                    <p>在法律允許的最大範圍內，CatchUp 不對因使用或無法使用本服務而引起的任何直接、間接、附帶、特殊或後果性的損害負責。</p>
                </section>

                <section>
                    <h2>9. 條款變更</h2>
                    <p>我們保留隨時自行決定修改或替換本條款的權利。如果修訂是重大的，我們將盡力在任何新條款生效前提供至少 30 天的通知。</p>
                </section>

                <section>
                    <h2>10. 聯絡我們</h2>
                    <p>如果您對本條款有任何疑問，請聯繫我們。</p>
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
</style>
