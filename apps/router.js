import { AppRegistry } from './registry.js';

let navigationHistory = [];
let currentAppId = null;

export const Router = {
    open(appId) {
        const app = AppRegistry.getById(appId);
        if (!app) return;

        const homeScreen = document.getElementById('home-screen');
        const appWindow = document.getElementById('app-window');

        if (currentAppId) navigationHistory.push(currentAppId);
        currentAppId = appId;

        homeScreen.style.display = 'none';
        appWindow.style.display = 'flex';
        appWindow.innerHTML = '';
        appWindow.classList.add('app-opening');

        app.render(appWindow);

        appWindow.addEventListener(
            'animationend',
            () => appWindow.classList.remove('app-opening'),
            { once: true }
        );
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
        currentAppId = null;
        navigationHistory = [];
        const appWindow = document.getElementById('app-window');
        const homeScreen = document.getElementById('home-screen');
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
    },

    getCurrent() {
        return currentAppId;
    },
};
