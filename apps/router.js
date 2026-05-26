import { AppRegistry } from './registry.js';
import { Background } from './background.js';

let navigationHistory = [];
let currentAppId = null;

export const Router = {
    open(appId) {
        const app = AppRegistry.getById(appId);
        if (!app) return;

        const homeScreen = document.getElementById('home-screen');
        const appWindow = document.getElementById('app-window');

        // If navigating away from a background app, hide it immediately
        // (no closing animation needed — the new app slides in over it)
        if (currentAppId && Background.isRegistered(currentAppId)) {
            Background.suspendImmediate(currentAppId);
        }

        if (currentAppId) navigationHistory.push(currentAppId);
        currentAppId = appId;

        homeScreen.style.display = 'none';

        if (Background.isRegistered(appId)) {
            // Background app: mount (or re-show) its persistent container.
            // Clear appWindow so any previous normal app isn't lurking hidden.
            appWindow.style.display = 'none';
            appWindow.innerHTML = '';
            Background.mount(appId, (container) => app.render(container));
        } else {
            appWindow.style.display = 'flex';
            appWindow.innerHTML = '';
            appWindow.classList.add('app-opening');
            app.render(appWindow);
            appWindow.addEventListener(
                'animationend',
                () => appWindow.classList.remove('app-opening'),
                { once: true }
            );
        }
    },

    back() {
        const previousAppId = navigationHistory.pop();
        if (previousAppId) {
            Router.open(previousAppId);
        } else {
            Router.home();
        }
    },

    home() {
        const closingAppId = currentAppId;
        currentAppId = null;
        navigationHistory = [];

        const appWindow = document.getElementById('app-window');
        const homeScreen = document.getElementById('home-screen');

        if (closingAppId && Background.isRegistered(closingAppId)) {
            // Suspend the background app — it keeps running silently
            Background.suspend(closingAppId);
            homeScreen.style.display = 'grid';
        } else {
            appWindow.classList.add('app-closing');
            appWindow.addEventListener(
                'animationend',
                () => {
                    appWindow.classList.remove('app-closing');
                    appWindow.style.display = 'none';
                    appWindow.innerHTML = '';
                    homeScreen.style.display = 'grid';
                },
                { once: true }
            );
        }
    },

    getCurrent() {
        return currentAppId;
    },
};
