class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'zh', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
    }

    detectLanguage() {
        try {
            const params = new URLSearchParams(window.location.search);
            const urlLang = params.get('lang');
            if (urlLang && this.supportedLanguages.includes(urlLang)) return urlLang;
        } catch (e) {}

        try {
            const savedLang = localStorage.getItem('app_language');
            if (savedLang && this.supportedLanguages.includes(savedLang)) return savedLang;
        } catch (e) {}

        const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) return browserLang;
        return 'en';
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`js/locales/${lang}.json?v=20261115-focus`);
            if (!response.ok) throw new Error('Not found');
            this.translations[lang] = await response.json();
            return true;
        } catch (e) {
            if (lang !== 'en') return this.loadTranslations('en');
            return false;
        }
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key;
            }
        }
        return value;
    }

    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return false;
        if (!this.translations[lang]) await this.loadTranslations(lang);
        this.currentLang = lang;
        try {
            localStorage.setItem('app_language', lang);
        } catch (e) {}
        this.updateUI();
        return true;
    }

    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const val = this.t(el.getAttribute('data-i18n'));
            if (val !== el.getAttribute('data-i18n')) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const val = this.t(el.getAttribute('data-i18n-html'));
            if (val !== el.getAttribute('data-i18n-html')) el.innerHTML = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
        });
        const title = this.t('app.title');
        if (title !== 'app.title') document.title = title;
        const meta = document.querySelector('meta[name="description"]');
        const desc = this.t('app.description');
        if (meta && desc !== 'app.description') meta.content = desc;
        document.documentElement.lang = this.currentLang;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getLanguageName(lang) {
        const names = {
            'ko': '한국어',
            'en': 'English',
            'ja': '日本語',
            'es': 'Español',
            'pt': 'Português',
            'zh': '简体中文',
            'id': 'Bahasa Indonesia',
            'tr': 'Türkçe',
            'de': 'Deutsch',
            'fr': 'Français',
            'hi': 'हिन्दी',
            'ru': 'Русский'
        };
        return names[lang] || lang;
    }
}

const i18n = new I18n();
window.i18n = i18n;
