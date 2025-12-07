<template>
    <div class="policy-page">
        <AppHeader />
        <div class="policy-container">

            <div class="policy-header">
                <h1>{{ $t('refund_policy.title') }}</h1>
            </div>

            <div class="policy-content">
                <section>
                    <p>{{ $t('refund_policy.intro') }}</p>
                </section>

                <section>
                    <h2>{{ $t('refund_policy.sections.cancellation.title') }}</h2>
                    <p>{{ $t('refund_policy.sections.cancellation.content') }}</p>
                </section>

                <section>
                    <h2>{{ $t('refund_policy.sections.discretion.title') }}</h2>
                    <p style="white-space: pre-line;">{{ $t('refund_policy.sections.discretion.content') }}</p>
                </section>

                <section>
                    <h2>{{ $t('refund_policy.sections.process.title') }}</h2>
                    <p>{{ $t('refund_policy.sections.process.content') }}</p>
                    <ul>
                        <li v-for="(item, index) in $tm('refund_policy.sections.process.list')" :key="index">
                            {{ item }}
                        </li>
                    </ul>
                    <p style="margin-top: 16px;">{{ $t('refund_policy.sections.process.note') }}</p>
                </section>

                <section>
                    <h2>{{ $t('refund_policy.sections.merchant.title') }}</h2>
                    <p>{{ $t('refund_policy.sections.merchant.content') }}</p>
                </section>


            </div>
        </div>
        <AppFooter />
    </div>
</template>

<script setup>
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<style scoped>
.policy-page {
    width: 100%;
    height: 100vh;
    background: #f5f7fa;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
}

.policy-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 120px 20px 80px;
    flex: 1 0 auto;
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

.contact-section {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid #f3f4f6;
}
</style>
