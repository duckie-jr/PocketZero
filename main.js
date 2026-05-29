import { AppRegistry } from './apps/registry.js';
import { Background } from './apps/background.js';
import { Router } from './apps/router.js';
import { Store } from './apps/store.js';
import { Dialog } from './apps/dialog.js';
import { EventBus } from './apps/eventbus.js';
import { Badge } from './apps/badge.js';
import { Sound } from './apps/sound.js';
import { Http } from './apps/http.js';
import { Notify } from './apps/notify.js';
import { ICON_DARKMODE, ICON_VOLUME } from './icons/svg.js';
import './apps/index.js';

// Register service worker for PWA installability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            console.warn('Service worker registration failed:', error);
        });
    });
}

// ── Theme ─────────────────────────────────────────────────────
function applyTheme(theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

const savedTheme = Store.get('theme') ?? 'system';
applyTheme(savedTheme);

// ── Shell — force visible immediately ─────────────────────────
const shellEl = document.getElementById('shell');
if (shellEl) {
    shellEl.style.display = 'flex';
    const defaultWallpaper = 'linear-gradient(160deg,#1a1a2e,#16213e)';
    shellEl.style.background = Store.get('wallpaper') ?? defaultWallpaper;
}

// ── Sleep Screen ──────────────────────────────────────────────
const sleepScreen  = document.getElementById('sleep-screen');
const sleepTimeEl  = document.getElementById('sleep-time');
const sleepDateEl  = document.getElementById('sleep-date');
let   sleepClockInterval = null;
let   sleepLocked = false;

function formatSleepTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSleepDate() {
    return new Date().toLocaleDateString([], {
        weekday: 'long', month: 'long', day: 'numeric',
    });
}

function updateSleepClock() {
    if (sleepTimeEl) sleepTimeEl.textContent = formatSleepTime();
    if (sleepDateEl) sleepDateEl.textContent = formatSleepDate();
}

function enterSleep({ locked = false } = {}) {
    if (!sleepScreen) return;
    sleepLocked = locked;
    updateSleepClock();
    sleepClockInterval = setInterval(updateSleepClock, 1000);
    sleepScreen.style.opacity = '0';
    sleepScreen.classList.add('active');
    requestAnimationFrame(() => {
        sleepScreen.style.transition = 'opacity 0.4s ease';
        sleepScreen.style.opacity = '1';
    });
}

function exitSleep() {
    if (!sleepScreen) return;
    sleepScreen.style.transition = 'opacity 0.3s ease';
    sleepScreen.style.opacity = '0';
    clearInterval(sleepClockInterval);
    sleepClockInterval = null;
    setTimeout(() => sleepScreen.classList.remove('active'), 300);
}

function lockSleep() { sleepLocked = true; }
function unlockSleep() { sleepLocked = false; }
function isSleeping() { return sleepScreen?.classList.contains('active') ?? false; }

if (sleepScreen) {
    sleepScreen.addEventListener('pointerdown', () => { if (!sleepLocked) exitSleep(); });
}

// ── Status Bar ────────────────────────────────────────────────
function updateStatusTime() {
    const statusTimeEl = document.getElementById('status-time');
    if (statusTimeEl) {
        statusTimeEl.textContent = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit',
        });
    }
}

updateStatusTime();
setInterval(updateStatusTime, 1000);

// ── Home Screen Builder ───────────────────────────────────────
function buildHomeScreen() {
    const homeScreen = document.getElementById('home-screen');
    if (!homeScreen) return;

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

    Badge.refresh();
}

setTimeout(buildHomeScreen, 0);

// ── Global PocketZero API ─────────────────────────────────────
window.PocketZero = {
    Router,
    AppRegistry,
    Store,
    Notify,
    Dialog,
    EventBus,
    Badge,
    Sound,
    Http,
    buildHomeScreen,
    Background,
    enterSleep,
    exitSleep,
    lockSleep,
    unlockSleep,
    isSleeping,
};

// ── Home Bar ──────────────────────────────────────────────────
const homeBarEl = document.getElementById('home-bar');
if (homeBarEl) {
    homeBarEl.addEventListener('click', () => {
        if (document.getElementById('app-window')?.style.display !== 'none') {
            Router.home();
        }
    });
}

// ── Control Center ────────────────────────────────────────────
const controlCenter = document.getElementById('control-center');
let ccTouchStartY = 0;
let ccIsOpen = false;

function openControlCenter() {
    ccIsOpen = true;
    if (controlCenter) controlCenter.classList.add('open');
}

function closeControlCenter() {
    ccIsOpen = false;
    if (controlCenter) controlCenter.classList.remove('open');
}

if (homeBarEl) {
    homeBarEl.addEventListener('touchstart', (e) => {
        ccTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    homeBarEl.addEventListener('touchmove', (e) => {
        if (ccTouchStartY - e.touches[0].clientY > 20) openControlCenter();
    }, { passive: true });
}

if (controlCenter) {
    controlCenter.addEventListener('touchstart', (e) => {
        ccTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    controlCenter.addEventListener('touchmove', (e) => {
        if (e.touches[0].clientY - ccTouchStartY > 30) closeControlCenter();
    }, { passive: true });
}

document.addEventListener('click', (e) => {
    if (ccIsOpen && controlCenter && !controlCenter.contains(e.target)) {
        closeControlCenter();
    }
});

// Dark mode tile
const darkmodeIcon = document.getElementById('cc-darkmode-icon');
const darkmodeTile = document.getElementById('cc-darkmode');
if (darkmodeIcon) darkmodeIcon.innerHTML = ICON_DARKMODE;

function refreshDarkmodeTile() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (darkmodeTile) darkmodeTile.classList.toggle('active', isDark);
}

if (darkmodeTile) {
    darkmodeTile.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        Store.set('theme', newTheme);
        applyTheme(newTheme);
        refreshDarkmodeTile();
        EventBus.emit('theme:changed', newTheme);
    });
}

refreshDarkmodeTile();

// Sound tile
const soundIcon = document.getElementById('cc-sound-icon');
const soundTile = document.getElementById('cc-sound');
if (soundIcon) soundIcon.innerHTML = ICON_VOLUME;

let soundEnabled = Store.get('sound') !== false;
if (soundTile) {
    soundTile.classList.toggle('active', soundEnabled);
    soundTile.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        Store.set('sound', soundEnabled);
        soundTile.classList.toggle('active', soundEnabled);
    });
}

// Sleep tile
const sleepTile = document.getElementById('cc-sleep');
if (sleepTile) {
    sleepTile.addEventListener('click', () => {
        closeControlCenter();
        setTimeout(enterSleep, 180);
    });
}

// Brightness slider
const brightnessSlider = document.getElementById('cc-brightness');
if (brightnessSlider) {
    brightnessSlider.addEventListener('input', (e) => {
        document.documentElement.style.filter = `brightness(${e.target.value}%)`;
    });
}
