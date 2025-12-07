<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand-col">
                    <div class="footer-brand">
                        <img src="@/assets/logo.png" alt="Logo" class="footer-logo" />
                        <span class="footer-title">{{ appName }}</span>
                    </div>
                    <p class="footer-desc">{{ $t('app.description') }}</p>
                </div>

                <div class="footer-nav-col">
                    <h4 class="footer-heading">{{ $t('footer.products') }}</h4>
                    <ul class="footer-links">
                        <li><a href="#">{{ $t('footer.features') }}</a></li>
                        <li><router-link to="/subscription">{{ $t('footer.pricing') }}</router-link></li>
                    </ul>
                </div>

                <div class="footer-nav-col">
                    <h4 class="footer-heading">{{ $t('footer.resources') }}</h4>
                    <ul class="footer-links">
                        <li><a href="#">{{ $t('footer.tutorials') }}</a></li>
                        <li><router-link to="/faq">{{ $t('footer.faq') }}</router-link></li>
                        <li><a href="#">{{ $t('footer.blog') }}</a></li>
                        <li><a href="#">{{ $t('footer.contact') }}</a></li>
                    </ul>
                </div>

                <div class="footer-newsletter-col">
                    <h4 class="footer-heading">{{ $t('footer.newsletter') }}</h4>
                    <p class="newsletter-desc">{{ $t('footer.newsletter_desc') }}</p>
                    <form class="newsletter-form" @submit.prevent>
                        <div class="input-group">
                            <input type="email" :placeholder="$t('footer.email_placeholder')" class="newsletter-input" />
                            <button type="submit" class="newsletter-btn">
                                <font-awesome-icon icon="arrow-right" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-legal">
                    <router-link to="/privacy-policy">{{ $t('footer.privacy') }}</router-link>
                    <router-link to="/terms-of-service">{{ $t('footer.terms') }}</router-link>
                    <router-link to="/cookie-policy">{{ $t('footer.cookie') }}</router-link>
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
    font-size: 15px;
}

.footer-top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 2fr;
    gap: 64px;
    margin-bottom: 64px;
}

.footer-brand-col {
    max-width: 320px;
}

.footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.footer-logo {
    height: 40px;
    width: auto;
}

.footer-title {
    font-size: 24px;
    font-weight: 700;
    color: white;
}

.footer-desc {
    line-height: 1.6;
    margin-bottom: 32px;
}

.footer-heading {
    color: white;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 24px;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-links li {
    margin-bottom: 12px;
}

.footer-links a {
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s ease;
}

.footer-links a:hover {
    color: white;
}

.newsletter-desc {
    margin-bottom: 24px;
    line-height: 1.6;
}

.input-group {
    display: flex;
    gap: 8px;
}

.newsletter-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    transition: all 0.3s ease;
}

.newsletter-input:focus {
    outline: none;
    border-color: #4338ca;
    background: rgba(255, 255, 255, 0.1);
}

.newsletter-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #4338ca;
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.newsletter-btn:hover {
    background: #3730a3;
    transform: translateY(-2px);
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
    font-size: 14px;
    transition: color 0.2s ease;
}

.footer-legal a:hover {
    color: white;
}

.copyright {
    color: #64748b;
    font-size: 14px;
}

@media (max-width: 1024px) {
    .footer-top {
        grid-template-columns: 1fr 1fr;
        gap: 48px;
    }
}

@media (max-width: 768px) {
    .footer-top {
        grid-template-columns: 1fr;
        gap: 40px;
    }

    .footer-brand-col {
        max-width: 100%;
    }

    .footer-bottom {
        flex-direction: column;
        text-align: center;
    }

    .footer-legal {
        justify-content: center;
    }
}


</style>
