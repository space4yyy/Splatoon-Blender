import './language-picker.js';

// Translate only shared navigation and preview status, not page content.
const messages = {
    USen: { backHome: 'Back to Home', updatingPreview: 'Updating preview…' },
    CNzh: { backHome: '返回首页', updatingPreview: '正在更新预览…' },
};

function detectLocale() {
    try {
        const saved = localStorage.getItem('resources-locale');
        if (saved) return saved === 'CNzh' ? 'CNzh' : 'USen';
    } catch {}
    return (navigator.languages || [navigator.language]).some(lang => /^zh/i.test(lang))
        ? 'CNzh' : 'USen';
}

let locale = detectLocale();
const selector = document.querySelector('#ui-language');
function updateText() {
    document.querySelectorAll('[data-ui-text]').forEach(element => {
        const text = messages[locale][element.dataset.uiText];
        if (text) {
            element.textContent = text;
            element.lang = locale === 'CNzh' ? 'zh-CN' : 'en';
        }
    });
    if (selector) {
        selector.value = locale;
        selector.dispatchEvent(new Event('language-picker-sync'));
    }
}

window.partialUiI18n = { text: key => messages[locale][key] };
selector?.addEventListener('change', () => {
    locale = selector.value === 'CNzh' ? 'CNzh' : 'USen';
    try { localStorage.setItem('resources-locale', locale); } catch {}
    updateText();
});
document.querySelector('#resource-language')?.addEventListener('change', event => {
    locale = event.target.value === 'CNzh' ? 'CNzh' : 'USen';
    updateText();
});
window.addEventListener('storage', event => {
    if (event.key === 'resources-locale') {
        locale = detectLocale();
        updateText();
    }
});
updateText();
