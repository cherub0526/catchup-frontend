<template>
    <div class="policy-page">
        <AppHeader />
        <div class="policy-container">

            <div class="policy-header">
                <h1>{{ $t('terms_of_service.title') }}</h1>
                
            </div>

            <div class="policy-content">
                <p>{{ $t('terms_of_service.intro') }}</p>
                <section>
                    <h2>{{ $t('terms_of_service.sections.scope.title') }}</h2>
                    <p v-for="(paragraph, index) in $tm('terms_of_service.sections.scope.content')" :key="index">
                        {{ paragraph }}
                    </p>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.account.title') }}</h2>
                    <ul class="no-bullet">
                        <li v-for="(paragraph, index) in $tm('terms_of_service.sections.account.content')" :key="index">
                            {{ paragraph }}
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.payment.title') }}</h2>
                    <ul class="no-bullet">
                        <li v-for="(paragraph, index) in $tm('terms_of_service.sections.payment.content')" :key="index">
                            {{ paragraph }}
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.usage.title') }}</h2>
                    <p>{{ $t('terms_of_service.sections.usage.intro') }}</p>
                    <ul>
                        <li v-for="(item, index) in $tm('terms_of_service.sections.usage.list')" :key="index">
                            {{ item }}
                        </li>
                    </ul>
                    <p class="warning-text">{{ $t('terms_of_service.sections.usage.penalty') }}</p>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.disclaimer.title') }}</h2>
                    <ul class="no-bullet">
                        <li v-for="(paragraph, index) in $tm('terms_of_service.sections.disclaimer.content')" :key="index">
                            {{ paragraph }}
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.changes.title') }}</h2>
                    <ul class="no-bullet">
                        <li v-for="(paragraph, index) in $tm('terms_of_service.sections.changes.content')" :key="index">
                            {{ paragraph }}
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.privacy.title') }}</h2>
                    <p>{{ $t('terms_of_service.sections.privacy.content') }}</p>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.law.title') }}</h2>
                    <ul class="no-bullet">
                        <li v-for="(paragraph, index) in $tm('terms_of_service.sections.law.content')" :key="index">
                            {{ paragraph }}
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>{{ $t('terms_of_service.sections.contact.title') }}</h2>
                    <p>{{ $t('terms_of_service.sections.contact.content') }}</p>
                </section>

                <div class="policy-footer-note">
                    <p>{{ $t('terms_of_service.sections.footer') }}</p>
                </div>
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

.intro-text {
    margin-top: 20px;
    color: #4b5563;
    line-height: 1.7;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.no-bullet {
    list-style-type: none;
    padding-left: 0;
}

.warning-text {
    color: #ef4444;
    font-weight: 500;
    margin-top: 16px;
}

.policy-footer-note {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid #f3f4f6;
    text-align: center;
    color: #64748b;
    font-weight: 500;
}
</style>
