import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { Dialog } from './dialog.js';
import { EventBus } from './eventbus.js';
import { Badge } from './badge.js';
import { Sound } from './sound.js';
import { Http } from './http.js';
import { ICON_STORE, ICON_BACK, ICON_TRASH, ICON_PLUS } from '../icons/svg.js';
import { STORE_CATALOG } from './store-catalog.js';

AppRegistry.register({
    id: 'playstore',
    name: 'Store',
    icon: ICON_STORE,
    removable: false,
    render: renderPlayStore,
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderPlayStore(container) {
    let activeTab = 'browse';

    function switchTab(tab) {
        activeTab = tab;
        container.querySelectorAll('.store-tab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        renderTabContent();
    }

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="store-back">${ICON_BACK}</button>
            <span class="app-chrome-title">Store</span>
            <span style="width:36px"></span>
        </div>
        <div class="tab-bar">
            <button class="store-tab tab-bar-btn active" data-tab="browse">Browse</button>
            <button class="store-tab tab-bar-btn" data-tab="custom">Custom</button>
            <button class="store-tab tab-bar-btn" data-tab="manage">Manage</button>
        </div>
        <div id="store-tab-body" class="app-body" style="gap:10px"></div>
    `;

    document.getElementById('store-back').addEventListener('click', () => Router.home());

    container.querySelectorAll('.store-tab').forEach((btn) => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    renderTabContent();

    // ── Tab renderers ─────────────────────────────────────────

    function renderTabContent() {
        const body = document.getElementById('store-tab-body');
        if (!body) return;
        if (activeTab === 'browse')  renderBrowseTab(body);
        if (activeTab === 'custom')  renderCustomTab(body);
        if (activeTab === 'manage')  renderManageTab(body);
    }

    // ── Browse tab ────────────────────────────────────────────
    function renderBrowseTab(body) {
        const installedIds = new Set(
            AppRegistry.getAll().filter((a) => a.removable).map((a) => a.id)
        );

        const categories = [...new Set(STORE_CATALOG.map((app) => app.category))];

        body.innerHTML = categories.map((category) => {
            const appsInCategory = STORE_CATALOG.filter((app) => app.category === category);
            return `
                <div>
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);
                                letter-spacing:1px;margin-bottom:8px">${category.toUpperCase()}</div>
                    ${appsInCategory.map((app) => {
                        const isInstalled = installedIds.has(app.id) ||
                            AppRegistry.getById(app.id) !== null;
                        return `
                            <div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
                                <div style="width:48px;height:48px;border-radius:12px;
                                            background:var(--bg-tertiary);display:flex;
                                            align-items:center;justify-content:center;
                                            font-size:11px;font-weight:700;color:var(--text-muted);
                                            flex-shrink:0">
                                    ${escapeHtml(app.name.slice(0,3).toUpperCase())}
                                </div>
                                <div style="flex:1;min-width:0">
                                    <div style="font-size:15px;font-weight:600;color:var(--text-primary)">${escapeHtml(app.name)}</div>
                                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(app.description)}</div>
                                </div>
                                <button
                                    class="store-install-btn pz-btn ${isInstalled ? 'secondary' : ''}"
                                    data-id="${app.id}"
                                    ${isInstalled ? 'disabled' : ''}
                                    style="flex-shrink:0;padding:6px 14px;font-size:13px;${isInstalled ? 'opacity:0.5' : ''}">
                                    ${isInstalled ? 'Installed' : 'Install'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('');

        body.querySelectorAll('.store-install-btn:not([disabled])').forEach((btn) => {
            btn.addEventListener('click', () => installCatalogApp(btn.dataset.id, btn));
        });
    }

    async function installCatalogApp(appId, btn) {
        btn.textContent = 'Installing...';
        btn.disabled = true;

        try {
            // Dynamically import the app module from the apps/ folder
            const module = await import(`./${appId}.js`);
            Notify.show(`${appId} installed`);
            window.PocketZero?.buildHomeScreen();
            btn.textContent = 'Installed';
            btn.classList.add('secondary');
            btn.style.opacity = '0.5';
        } catch (err) {
            Notify.show(`Install failed: ${appId} not found`);
            btn.textContent = 'Install';
            btn.disabled = false;
        }
    }

    // ── Custom tab ────────────────────────────────────────────
    function renderCustomTab(body) {
        body.innerHTML = `
            <div class="card">
                <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:6px">Custom App Creator</div>
                <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5">
                    Write or paste a JS app module below. Your code must call
                    <code style="background:var(--bg-tertiary);padding:1px 5px;border-radius:4px;font-size:12px">AppRegistry.register({...})</code>
                    to appear on the home screen.
                </div>
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;display:flex;flex-wrap:wrap;gap:4px">
                    <span>Available globals:</span>
                    ${['AppRegistry','Store','Router','Notify','Dialog','EventBus','Badge','Sound','Http'].map(
                        (name) => `<code style="background:var(--bg-tertiary);padding:1px 5px;border-radius:3px;font-size:11px">${name}</code>`
                    ).join('')}
                </div>
                <textarea id="custom-app-code"
                    class="pz-input"
                    spellcheck="false"
                    placeholder="// Example minimal app:
AppRegistry.register({
  id: 'myapp',
  name: 'My App',
  icon: '<svg viewBox=\\'0 0 48 48\\' ...></svg>',
  removable: true,
  render(container) {
    container.innerHTML = '<p>Hello from my app!</p>';
  }
});"
                    style="font-family:monospace;font-size:12px;min-height:220px;resize:vertical;line-height:1.5"></textarea>
                <div style="display:flex;gap:8px;margin-top:10px;align-items:center">
                    <button class="pz-btn" id="run-custom-app" style="flex:1">Run App</button>
                    <label class="pz-btn secondary" style="cursor:pointer;flex:1;text-align:center">
                        Load .js File
                        <input type="file" id="custom-app-file" accept=".js,text/javascript" style="display:none" />
                    </label>
                </div>
                <div id="custom-app-error" style="margin-top:8px;font-size:12px;color:var(--danger);display:none"></div>
            </div>

            <div class="card">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:10px">Starter Template</div>
                <pre style="font-size:11px;color:var(--text-secondary);background:var(--bg-tertiary);
                            padding:12px;border-radius:8px;overflow-x:auto;line-height:1.6;white-space:pre-wrap">// Imports available as globals inside the Store runner:
// AppRegistry, Store, Router, Notify

AppRegistry.register({
  id: 'myapp',           // unique id
  name: 'My App',        // label shown on home screen
  removable: true,       // allows uninstall from Manage tab
  icon: \`&lt;svg viewBox="0 0 48 48" fill="none"
    stroke="currentColor" stroke-width="2.5"
    stroke-linecap="round"
    xmlns="http://www.w3.org/2000/svg"&gt;
    &lt;circle cx="24" cy="24" r="16"/&gt;
  &lt;/svg&gt;\`,
  render(container) {
    container.innerHTML = \`
      &lt;div style="padding:20px;color:var(--text-primary)"&gt;
        Hello from My App!
      &lt;/div&gt;
    \`;
  }
});</pre>
            </div>
        `;

        document.getElementById('custom-app-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                document.getElementById('custom-app-code').value = evt.target.result;
            };
            reader.readAsText(file);
        });

        document.getElementById('run-custom-app').addEventListener('click', () => {
            const code = document.getElementById('custom-app-code').value.trim();
            const errorEl = document.getElementById('custom-app-error');
            errorEl.style.display = 'none';

            if (!code) {
                errorEl.textContent = 'No code to run.';
                errorEl.style.display = 'block';
                return;
            }

            try {
                // Inject all PocketZero API globals so custom apps can use them without imports
                const wrappedFn = new Function(
                    'AppRegistry', 'Store', 'Router', 'Notify',
                    'Dialog', 'EventBus', 'Badge', 'Sound', 'Http',
                    code
                );
                wrappedFn(AppRegistry, Store, Router, Notify, Dialog, EventBus, Badge, Sound, Http);
                window.PocketZero?.buildHomeScreen();
                Notify.show('Custom app installed');
            } catch (err) {
                errorEl.textContent = `Error: ${err.message}`;
                errorEl.style.display = 'block';
            }
        });
    }

    // ── Manage tab ────────────────────────────────────────────
    function renderManageTab(body) {
        const allApps = AppRegistry.getAll();
        const builtIn = allApps.filter((app) => !app.removable);
        const installed = allApps.filter((app) => app.removable);

        body.innerHTML = `
            <div class="card">
                <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:10px">
                    INSTALLED APPS (${installed.length})
                </div>
                ${installed.length === 0
                    ? `<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:12px">
                           No third-party apps installed
                       </div>`
                    : installed.map((app) => `
                        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;
                                    border-bottom:1px solid var(--border)">
                            <div style="width:36px;height:36px;border-radius:8px;
                                        background:var(--bg-tertiary);display:flex;
                                        align-items:center;justify-content:center;flex-shrink:0">
                                ${app.icon}
                            </div>
                            <span style="flex:1;font-size:15px;color:var(--text-primary)">${escapeHtml(app.name)}</span>
                            <button class="pz-btn danger remove-app-btn"
                                    data-id="${app.id}"
                                    style="padding:6px 12px;font-size:12px">
                                Remove
                            </button>
                        </div>
                    `).join('')
                }
            </div>

            <div class="card">
                <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:10px">
                    BUILT-IN APPS (${builtIn.length})
                </div>
                ${builtIn.map((app) => `
                    <div style="display:flex;align-items:center;gap:12px;padding:8px 0;
                                border-bottom:1px solid var(--border)">
                        <div style="width:36px;height:36px;border-radius:8px;
                                    background:var(--bg-tertiary);display:flex;
                                    align-items:center;justify-content:center;flex-shrink:0">
                            ${app.icon}
                        </div>
                        <span style="flex:1;font-size:15px;color:var(--text-primary)">${escapeHtml(app.name)}</span>
                        <span style="font-size:12px;color:var(--text-muted)">Built-in</span>
                    </div>
                `).join('')}
            </div>
        `;

        body.querySelectorAll('.remove-app-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const appId = btn.dataset.id;
                AppRegistry.remove(appId);
                window.PocketZero?.buildHomeScreen();
                Notify.show('App removed');
                renderManageTab(body);
            });
        });
    }
}
