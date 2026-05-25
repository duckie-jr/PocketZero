let dismissTimeout = null;

export const Notify = {
    show(message, durationMs = 3000) {
        const bannerElement = document.getElementById('notification-banner');
        if (!bannerElement) return;
        bannerElement.textContent = message;
        bannerElement.classList.add('visible');

        if (dismissTimeout) clearTimeout(dismissTimeout);
        dismissTimeout = setTimeout(() => {
            bannerElement.classList.remove('visible');
        }, durationMs);
    },
};
