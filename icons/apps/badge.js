// Badge — show a notification count bubble on home screen app icons
// Usage:
//   Badge.set('todo', 3)     // show red bubble with "3"
//   Badge.set('todo', 0)     // remove badge
//   Badge.get('todo')        // returns 3
//   Badge.clear()            // remove all badges

const badgeCounts = new Map();

function updateBadgeDom(appId, count) {
    const iconEl = document.querySelector(`.app-icon[data-app-id="${appId}"] .app-icon-image`);
    if (!iconEl) return;

    const existingBadge = iconEl.querySelector('.app-badge');
    if (existingBadge) existingBadge.remove();

    if (count <= 0) return;

    const badge = document.createElement('div');
    badge.className = 'app-badge';
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.style.cssText = `
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;
        background: #ff3b30;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-primary);
        pointer-events: none;
        z-index: 5;
        font-family: var(--font);
    `;

    // app-icon-image needs position:relative for the badge to anchor
    iconEl.style.position = 'relative';
    iconEl.appendChild(badge);
}

export const Badge = {
    /**
     * Set the badge count for an app. Pass 0 to remove.
     * @param {string} appId
     * @param {number} count
     */
    set(appId, count) {
        const clamped = Math.max(0, Math.floor(count));
        if (clamped === 0) {
            badgeCounts.delete(appId);
        } else {
            badgeCounts.set(appId, clamped);
        }
        updateBadgeDom(appId, clamped);
    },

    /**
     * Get the current badge count for an app.
     * @param {string} appId
     * @returns {number}
     */
    get(appId) {
        return badgeCounts.get(appId) ?? 0;
    },

    /**
     * Increment the badge count by 1.
     * @param {string} appId
     */
    increment(appId) {
        Badge.set(appId, Badge.get(appId) + 1);
    },

    /**
     * Decrement the badge count by 1 (min 0).
     * @param {string} appId
     */
    decrement(appId) {
        Badge.set(appId, Badge.get(appId) - 1);
    },

    /**
     * Remove all badges from all app icons.
     */
    clear() {
        badgeCounts.forEach((_, appId) => updateBadgeDom(appId, 0));
        badgeCounts.clear();
    },

    /**
     * Re-render all current badges — call this after the home screen is rebuilt.
     * main.js calls this automatically inside buildHomeScreen().
     */
    refresh() {
        badgeCounts.forEach((count, appId) => updateBadgeDom(appId, count));
    },
};
