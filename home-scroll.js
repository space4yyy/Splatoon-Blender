const storageKey = 'splatoon-home-scroll';
let savedPosition = 0;

try {
    const value = Number(sessionStorage.getItem(storageKey));
    if (Number.isFinite(value) && value >= 0) savedPosition = value;
} catch {
    // Navigation still works if the browser disables session storage.
}

history.scrollRestoration = 'manual';

window.addEventListener('pagehide', () => {
    try {
        sessionStorage.setItem(storageKey, String(window.scrollY));
    } catch {}
});

function restorePosition() {
    try {
        // Restore as soon as the layout exists, before revealing the page.
        // Explicit section links take priority over the saved position.
        if (!window.location.hash) {
            window.scrollTo({ top: savedPosition, left: 0, behavior: 'instant' });
        }
    } finally {
        document.documentElement.classList.remove('restoring-home');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restorePosition, { once: true });
} else {
    restorePosition();
}
