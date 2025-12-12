<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-bottom">
                <div class="footer-legal">
                    <router-link to="/privacy-policy">{{ $t('footer.privacy') }}</router-link>
                    <router-link to="/terms-of-service">{{ $t('footer.terms') }}</router-link>

                    <router-link to="/refund-policy">{{ $t('footer.refund') }}</router-link>
                </div>

                <p class="copyright">&copy; {{ new Date().getFullYear() }} {{ appName }}. {{ $t('footer.rights_reserved') }}</p>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { APP_NAME } from "@/config/app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const appName = APP_NAME;
</script>

<style scoped>
.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
}

.footer {
    background: #0f172a;
    color: #94a3b8;
    padding: 80px 0 32px;
    font-size: 1.0625rem;
}

.footer-bottom {
    padding-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
}

.footer-legal {
    display: flex;
    gap: 24px;
}

.footer-legal a {
    color: #94a3b8;
    text-decoration: none;
    font-size: 1rem;
    transition: color 0.2s ease;
}

.footer-legal a:hover {
    color: white;
}

.copyright {
    color: #64748b;
    font-size: 1rem;
}


@media (max-width: 768px) {
    .footer-bottom {
        flex-direction: column;
        text-align: center;
    }

    .footer-legal {
        justify-content: center;
    }
}


</style>
