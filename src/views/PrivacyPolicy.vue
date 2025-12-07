<template>
    <div class="policy-page">
        <AppHeader />
        <div class="policy-container">

            <div class="policy-content">
                <!-- Last Updated -->
                <p v-html="$t('privacy_policy.last_updated')"></p>

                <!-- Introduction -->
                <h3 id="heading-introduction">{{ $t('privacy_policy.intro.title') }}</h3>
                <p v-html="$t('privacy_policy.intro.content')"></p>

                <!-- Data Controller -->
                <h3 id="heading-data-controller">{{ $t('privacy_policy.controller.title') }}</h3>
                <p>{{ $t('privacy_policy.controller.content') }}</p>

                <!-- Information Collection -->
                <h3 id="heading-information-collection">{{ $t('privacy_policy.collection.title') }}</h3>
                <p>{{ $t('privacy_policy.collection.intro') }}</p>
                <p v-html="$t('privacy_policy.collection.personal')"></p>
                <p v-html="$t('privacy_policy.collection.derivative')"></p>
                <p v-html="$t('privacy_policy.collection.social')"></p>

                <!-- Use of Information -->
                <h3 id="heading-use-of-your-information">{{ $t('privacy_policy.use.title') }}</h3>
                <p>{{ $t('privacy_policy.use.intro') }}</p>
                <ul>
                    <li v-for="(item, index) in $tm('privacy_policy.use.list')" :key="index">
                        <p>{{ item }}</p>
                    </li>
                </ul>

                <!-- Disclosure -->
                <h3 id="heading-disclosure-of-your-information">{{ $t('privacy_policy.disclosure.title') }}</h3>
                <p>{{ $t('privacy_policy.disclosure.intro') }}</p>
                <p v-for="(item, index) in $tm('privacy_policy.disclosure.items')" :key="index" v-html="item"></p>

                <!-- Security -->
                <h3 id="heading-security-of-your-information">{{ $t('privacy_policy.security.title') }}</h3>
                <p>{{ $t('privacy_policy.security.content') }}</p>

                <!-- Children -->
                <h3 id="heading-policy-for-children">{{ $t('privacy_policy.children.title') }}</h3>
                <p>{{ $t('privacy_policy.children.content') }}</p>

                <!-- User Rights -->
                <h3 id="heading-user-rights">{{ $t('privacy_policy.rights.title') }}</h3>
                <p>{{ $t('privacy_policy.rights.intro') }}</p>
                <ul>
                    <li v-for="(item, index) in $tm('privacy_policy.rights.list')" :key="index">
                        <p v-html="item"></p>
                    </li>
                </ul>
                <p>{{ $t('privacy_policy.rights.footer') }}</p>

                <!-- Changes -->
                <h3 id="heading-changes-to-this-privacy-policy">{{ $t('privacy_policy.changes.title') }}</h3>
                <p>{{ $t('privacy_policy.changes.content') }}</p>

                <!-- Contact -->
                <!-- <h3 id="heading-contact-us">{{ $t('privacy_policy.contact.title') }}</h3>
                <p>{{ $t('privacy_policy.contact.content') }}</p>
                <p v-html="$t('privacy_policy.contact.info')"></p>
                <p v-html="$t('privacy_policy.contact.dpo')"></p> -->

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

.policy-content {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-top: 24px;
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
    margin-bottom: 16px;
}

li {
    margin-bottom: 8px;
}

/* Deep selector to style v-html content */
:deep(strong) {
    color: #374151;
    font-weight: 600;
}

</style>
