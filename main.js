import { AppRegistry } from './apps/registry.js';
import { Router } from './apps/router.js';
import { Store } from './apps/store.js';
import { Dialog } from './apps/dialog.js';
import { EventBus } from './apps/eventbus.js';
import { Badge } from './apps/badge.js';
import { Sound } from './apps/sound.js';
import { Http } from './apps/http.js';
import { Notify } from './apps/notify.js';
import { ICON_WIFI, ICON_BATTERY, ICON_DARKMODE, ICON_VOLUME } from './icons/svg.js';
import './apps/index.js';

// ── Theme ────────────────────────────────────────────────────
function applyTheme(theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

const savedTheme = Store.get('theme') ?? 'system';
applyTheme(savedTheme);

// ── Lock Screen ───────────────────────────────────────────────
function formatLockTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLockDate() {
    return new Date().toLocaleDateString([], {
        weekday: 'long', month: 'long', day: 'numeric',
    });
}

const lockTimeEl = document.getElementById('lock-time');
const lockDateEl = document.getElementById('lock-date');

function updateLockClock() {
    lockTimeEl.textContent = formatLockTime();
    lockDateEl.textContent = formatLockDate();
}

updateLockClock();
setInterval(updateLockClock, 1000);

function unlock() {
    const lockScreen = document.getElementById('lock-screen');
    const shell = document.getElementById('shell');
    lockScreen.style.transition = 'opacity 0.3s ease';
    lockScreen.style.opacity = '0';
    setTimeout(() => {
        lockScreen.style.display = 'none';
        shell.style.display = 'flex';
    }, 300);
}

const lockScreen = document.getElementById('lock-screen');
lockScreen.addEventListener('click', unlock);

let lockTouchStartY = 0;
lockScreen.addEventListener('touchstart', (e) => {
    lockTouchStartY = e.touches[0].clientY;
}, { passive: true });
lockScreen.addEventListener('touchend', (e) => {
    const swipeDistance = lockTouchStartY - e.changedTouches[0].clientY;
    if (swipeDistance > 50) unlock();
}, { passive: true });

// ── Status Bar ────────────────────────────────────────────────
document.getElementById('status-wifi').innerHTML = ICON_WIFI;
document.getElementById('status-battery').innerHTML = ICON_BATTERY;

function updateStatusTime() {
    const statusTimeEl = document.getElementById('status-time');
    const now = new Date();
    statusTimeEl.textContent = now.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit',
    });
}

updateStatusTime();
setInterval(updateStatusTime, 1000);

// ── Home Screen Builder ───────────────────────────────────────
function buildHomeScreen() {
    const homeScreen = document.getElementById('home-screen');
    const fiveCol = Store.get('grid-cols') === 5;
    homeScreen.classList.toggle('five-col', fiveCol);
    homeScreen.innerHTML = '';

    AppRegistry.getAll().forEach((app) => {
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'app-icon';
        iconWrapper.dataset.appId = app.id;
        iconWrapper.innerHTML = `
            <div class="app-icon-image">${app.icon}</div>
            <span class="app-icon-label">${app.name}</span>
        `;
        iconWrapper.addEventListener('click', () => Router.open(app.id));
        homeScreen.appendChild(iconWrapper);
    });

    // Re-apply any existing badge counts after the icons are rebuilt
    Badge.refresh();
}

// Rebuild home screen after all apps have registered
setTimeout(buildHomeScreen, 0);

// ── Global PocketZero API ─────────────────────────────────────
// All modules are exposed here so apps loaded via the Play Store
// custom code runner can access the full API without imports.
window.PocketZero = {
    // Navigation
    Router,
    // App registry
    AppRegistry,
    // Persistence
    Store,
    // Notifications
    Notify,
    // iOS-style modal dialogs
    Dialog,
    // Pub/sub inter-app messaging
    EventBus,
    // Home screen icon badges
    Badge,
    // Web Audio tone/beep utilities
    Sound,
    // Fetch wrapper with JSON + timeout
    Http,
    // Rebuild the home screen icon grid
    buildHomeScreen,
};

// ── Home Bar — tap to go home ─────────────────────────────────
document.getElementById('home-bar').addEventListener('click', () => {
    if (document.getElementById('app-window').style.display !== 'none') {
        Router.home();
    }
});

// ── Control Center ────────────────────────────────────────────
const controlCenter = document.getElementById('control-center');
let ccTouchStartY = 0;
let ccIsOpen = false;

function openControlCenter() {
    ccIsOpen = true;
    controlCenter.classList.add('open');
}

function closeControlCenter() {
    ccIsOpen = false;
    controlCenter.classList.remove('open');
}

document.getElementById('home-bar').addEventListener('touchstart', (e) => {
    ccTouchStartY = e.touches[0].clientY;
}, { passive: true });

document.getElementById('home-bar').addEventListener('touchmove', (e) => {
    const swipeUp = ccTouchStartY - e.touches[0].clientY;
    if (swipeUp > 20) openControlCenter();
}, { passive: true });

controlCenter.addEventListener('touchstart', (e) => {
    ccTouchStartY = e.touches[0].clientY;
}, { passive: true });

controlCenter.addEventListener('touchmove', (e) => {
    const swipeDown = e.touches[0].clientY - ccTouchStartY;
    if (swipeDown > 30) closeControlCenter();
}, { passive: true });

// Click outside to close
document.addEventListener('click', (e) => {
    if (ccIsOpen && !controlCenter.contains(e.target)) {
        closeControlCenter();
    }
});

// Dark mode tile
const darkmodeIcon = document.getElementById('cc-darkmode-icon');
const darkmodeTile = document.getElementById('cc-darkmode');
darkmodeIcon.innerHTML = ICON_DARKMODE;

function refreshDarkmodeTile() {
    const currentTheme = Store.get('theme') ?? 'system';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    darkmodeTile.classList.toggle('active', isDark);
}

darkmodeTile.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    Store.set('theme', newTheme);
    applyTheme(newTheme);
    refreshDarkmodeTile();
    EventBus.emit('theme:changed', newTheme);
});

refreshDarkmodeTile();

// Sound tile
const soundIcon = document.getElementById('cc-sound-icon');
const soundTile = document.getElementById('cc-sound');
soundIcon.innerHTML = ICON_VOLUME;

let soundEnabled = Store.get('sound') !== false;
soundTile.classList.toggle('active', soundEnabled);

soundTile.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    Store.set('sound', soundEnabled);
    soundTile.classList.toggle('active', soundEnabled);
});

// Brightness slider
document.getElementById('cc-brightness').addEventListener('input', (e) => {
    document.documentElement.style.filter = `brightness(${e.target.value}%)`;
});
