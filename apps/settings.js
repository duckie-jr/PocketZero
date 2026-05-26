import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { ICON_SETTINGS, ICON_BACK } from '../icons/svg.js';

AppRegistry.register({
    id: 'settings',
    name: 'Settings',
    icon: ICON_SETTINGS,
    removable: false,
    render: renderSettings,
});

const WALLPAPERS = [
    { label: 'Midnight',  value: 'linear-gradient(160deg,#1a1a2e,#16213e)' },
    { label: 'Ocean',     value: 'linear-gradient(160deg,#1a6eff,#0d3b8e)' },
    { label: 'Forest',    value: 'linear-gradient(160deg,#134e1a,#2d8a3e)' },
    { label: 'Dusk',      value: 'linear-gradient(160deg,#4a1a6e,#8e2d8a)' },
    { label: 'Ember',     value: 'linear-gradient(160deg,#6e1a1a,#c0392b)' },
    { label: 'Slate',     value: 'linear-gradient(160deg,#2c3e50,#4a6274)' },
    { label: 'Sand',      value: 'linear-gradient(160deg,#c8a96e,#e8d5a3)' },
    { label: 'Minimal',   value: '#f2f2f7' },
];

function renderSettings(container) {
    let currentTheme    = Store.get('theme')      ?? 'system';
    let currentFontSize = Store.get('font-size')  ?? 16;
    let currentGridCols = Store.get('grid-cols')  ?? 4;
    let soundEnabled    = Store.get('sound')      !== false;
    let currentWallpaper = Store.get('wallpaper') ?? WALLPAPERS[0].value;

    function applyFontSize(size) {
        document.documentElement.style.setProperty('--font-size-base', `${size}px`);
    }

    function applyWallpaper(value) {
        // Set on #shell so wallpaper shows behind the transparent status bar and home bar
        const shell = document.getElementById('shell');
        if (shell) {
            shell.style.background = value;
        }
    }

    function render() {
        container.innerHTML = `
            <div class="app-chrome">
                <button class="app-chrome-btn" id="settings-back">${ICON_BACK}</button>
                <span class="app-chrome-title">Settings</span>
                <span style="width:36px"></span>
            </div>
            <div class="app-body" style="gap:10px">

                <!-- Theme -->
                <div class="card">
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:12px">APPEARANCE</div>
                    <div style="display:flex;flex-direction:column;gap:8px">
                        <div style="display:flex;align-items:center;justify-content:space-between">
                            <span style="font-size:15px;color:var(--text-primary)">Theme</span>
                            <select id="theme-select" style="background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:14px;outline:none">
                                <option value="system"  ${currentTheme === 'system'  ? 'selected' : ''}>System</option>
                                <option value="light"   ${currentTheme === 'light'   ? 'selected' : ''}>Light</option>
                                <option value="dark"    ${currentTheme === 'dark'    ? 'selected' : ''}>Dark</option>
                            </select>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between">
                            <span style="font-size:15px;color:var(--text-primary)">Font Size <span style="color:var(--text-muted);font-size:13px">(${currentFontSize}px)</span></span>
                            <input type="range" id="font-size-slider"
                                min="13" max="20" value="${currentFontSize}"
                                style="width:140px;accent-color:var(--accent)" />
                        </div>
                    </div>
                </div>

                <!-- Wallpaper -->
                <div class="card">
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:12px">WALLPAPER</div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px">
                        ${WALLPAPERS.map((wp) => `
                            <div class="wp-swatch" data-value="${escapeHtml(wp.value)}"
                                 style="width:56px;height:56px;border-radius:10px;cursor:pointer;
                                        background:${wp.value};
                                        box-shadow:${currentWallpaper === wp.value ? '0 0 0 3px var(--accent)' : 'var(--shadow-sm)'};
                                        transition:box-shadow 0.15s;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px">
                                <span style="font-size:9px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.6);font-weight:600">${wp.label}</span>
                            </div>
                        `).join('')}
                    </div>
                    <label style="display:flex;align-items:center;gap:10px;margin-top:12px;cursor:pointer">
                        <span style="font-size:14px;color:var(--text-secondary)">Custom image</span>
                        <input type="file" id="wallpaper-upload" accept="image/*" style="display:none" />
                        <span class="pz-btn secondary" style="padding:6px 12px;font-size:12px;pointer-events:none">Upload</span>
                    </label>
                </div>

                <!-- Home Screen -->
                <div class="card">
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:12px">HOME SCREEN</div>
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <span style="font-size:15px;color:var(--text-primary)">Icon Grid</span>
                        <div style="display:flex;gap:6px">
                            <button class="pz-btn ${currentGridCols === 4 ? '' : 'secondary'}" id="grid-4" style="padding:6px 14px;font-size:13px">4 col</button>
                            <button class="pz-btn ${currentGridCols === 5 ? '' : 'secondary'}" id="grid-5" style="padding:6px 14px;font-size:13px">5 col</button>
                        </div>
                    </div>
                </div>

                <!-- Sound -->
                <div class="card">
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:12px">SYSTEM</div>
                    <div style="display:flex;flex-direction:column;gap:10px">
                        <div style="display:flex;align-items:center;justify-content:space-between">
                            <span style="font-size:15px;color:var(--text-primary)">Sound</span>
                            <button id="sound-toggle" class="pz-btn ${soundEnabled ? '' : 'secondary'}" style="padding:6px 16px;font-size:13px">
                                ${soundEnabled ? 'On' : 'Off'}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Danger zone -->
                <div class="card" style="border:1px solid var(--danger)20">
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:12px">DATA</div>
                    <button class="pz-btn danger" id="clear-data-btn" style="width:100%">Clear All Data</button>
                </div>

            </div>
        `;

        document.getElementById('settings-back').addEventListener('click', () => Router.home());

        // Theme
        document.getElementById('theme-select').addEventListener('change', (e) => {
            currentTheme = e.target.value;
            Store.set('theme', currentTheme);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = currentTheme === 'dark' || (currentTheme === 'system' && prefersDark);
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            Notify.show('Theme updated');
        });

        // Font size
        document.getElementById('font-size-slider').addEventListener('input', (e) => {
            currentFontSize = parseInt(e.target.value);
            Store.set('font-size', currentFontSize);
            applyFontSize(currentFontSize);
            render();
        });

        // Wallpaper swatches
        container.querySelectorAll('.wp-swatch').forEach((swatch) => {
            swatch.addEventListener('click', () => {
                currentWallpaper = swatch.dataset.value;
                Store.set('wallpaper', currentWallpaper);
                applyWallpaper(currentWallpaper);
                render();
            });
        });

        // Custom wallpaper upload
        document.getElementById('wallpaper-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const objectUrl = URL.createObjectURL(file);
            const cssValue = `url("${objectUrl}") center/cover no-repeat`;
            currentWallpaper = cssValue;
            Store.set('wallpaper', cssValue);
            applyWallpaper(cssValue);
            render();
        });

        // Grid cols
        document.getElementById('grid-4').addEventListener('click', () => {
            currentGridCols = 4;
            Store.set('grid-cols', 4);
            window.PocketZero?.buildHomeScreen();
            render();
        });
        document.getElementById('grid-5').addEventListener('click', () => {
            currentGridCols = 5;
            Store.set('grid-cols', 5);
            window.PocketZero?.buildHomeScreen();
            render();
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            Store.set('sound', soundEnabled);
            render();
        });

        // Clear data
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('Clear all PocketZero data? This cannot be undone.')) {
                Store.clear();
                Notify.show('All data cleared');
                Router.home();
            }
        });
    }

    render();
    applyFontSize(currentFontSize);
    applyWallpaper(currentWallpaper);
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
