// Map of appId → persistent HTMLElement container
const backgroundContainers = new Map();

// Set of app IDs that have opted into background mode
const registeredBackgroundAppIds = new Set();

export const Background = {
    // Declare an app as background-capable. Call this before or alongside
    // AppRegistry.register(). The app's render function will only be called
    // once — subsequent opens reuse the live container.
    register(appId) {
        registeredBackgroundAppIds.add(appId);
    },

    // Returns true if this app has opted into background mode.
    isRegistered(appId) {
        return registeredBackgroundAppIds.has(appId);
    },

    // Returns true if the app has been rendered at least once and has a
    // live container in the DOM.
    isAlive(appId) {
        return backgroundContainers.has(appId);
    },

    // Show the app. On first call, creates a persistent container, calls
    // renderFn(container), and appends it to #shell. On subsequent calls,
    // just makes the existing container visible again (audio/state intact).
    mount(appId, renderFn) {
        const shell = document.getElementById('shell');
        let container = backgroundContainers.get(appId);

        if (!container) {
            container = document.createElement('div');
            container.id = `bg-app-${appId}`;
            container.style.cssText = [
                'position:absolute',
                'inset:0',
                'display:none',
                'flex-direction:column',
                'z-index:5',
                'background:var(--bg-primary)',
                'overflow:hidden',
            ].join(';');
            shell.appendChild(container);
            backgroundContainers.set(appId, container);
            renderFn(container);
        }

        container.style.display = 'flex';
        container.classList.add('app-opening');
        container.addEventListener(
            'animationend',
            () => container.classList.remove('app-opening'),
            { once: true }
        );

        return container;
    },

    // Hide the app with a closing animation. Audio and all JS state are
    // preserved — the app keeps running silently in the background.
    suspend(appId) {
        const container = backgroundContainers.get(appId);
        if (!container) return;

        container.classList.add('app-closing');
        container.addEventListener(
            'animationend',
            () => {
                container.classList.remove('app-closing');
                container.style.display = 'none';
            },
            { once: true }
        );
    },

    // Hide immediately with no animation. Used when another app is opening
    // on top so the closing animation isn't needed.
    suspendImmediate(appId) {
        const container = backgroundContainers.get(appId);
        if (container) container.style.display = 'none';
    },

    // Permanently destroy the container and remove the app from background
    // tracking. Useful when uninstalling a background-capable app.
    kill(appId) {
        const container = backgroundContainers.get(appId);
        if (container) {
            container.remove();
            backgroundContainers.delete(appId);
        }
        registeredBackgroundAppIds.delete(appId);
    },
};
