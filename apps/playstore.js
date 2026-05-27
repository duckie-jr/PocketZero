import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { Dialog } from './dialog.js';
import { EventBus } from './eventbus.js';
import { Badge } from './badge.js';
import { Sound } from './sound.js';
import { Http } from './http.js';
import { ICON_STORE, ICON_BACK } from '../icons/svg.js';
import { STORE_CATALOG, CATEGORY_META } from './store-catalog.js';

AppRegistry.register({
    id: 'playstore',
    name: 'Store',
    icon: ICON_STORE,
    removable: false,
    render: renderPlayStore,
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < Math.floor(rating)) stars += '★';
        else if (i === Math.floor(rating) && rating % 1 >= 0.5) stars += '½';
        else stars += '☆';
    }
    return stars;
}

// Deterministic pastel color from a string
function appIconColor(name) {
    const palette = ['#8b5cf6','#ec4899','#f59e0b','#22c55e','#06b6d4','#ef4444','#6366f1','#14b8a6','#f97316'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
    return palette[hash % palette.length];
}

function renderPlayStore(container) {
    let activeTab = 'browse';

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
        <div id="store-tab-body" class="app-body" style="gap:0;padding:0"></div>
    `;

    document.getElementById('store-back').addEventListener('click', () => Router.home());
    container.querySelectorAll('.store-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            container.querySelectorAll('.store-tab').forEach(b => b.classList.toggle('active', b === btn));
            renderTabContent();
        });
    });

    renderTabContent();

    function renderTabContent() {
        const body = document.getElementById('store-tab-body');
        if (!body) return;
        if (activeTab === 'browse') renderBrowseTab(body);
        if (activeTab === 'custom') renderCustomTab(body);
        if (activeTab === 'manage') renderManageTab(body);
    }

    // ── Browse ─────────────────────────────────────────────────────────────────

    function renderBrowseTab(body) {
        body.style.padding = '0';
        body.innerHTML = `
            <div style="padding:12px 12px 8px">
                <div style="position:relative">
                    <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);opacity:0.4;pointer-events:none"
                         viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
                    </svg>
                    <input id="store-search" class="pz-input" placeholder="Search apps…" style="padding-left:34px;font-size:14px"/>
                </div>
            </div>
            <div id="store-catalog-list" style="padding:0 12px 12px"></div>`;

        function renderCatalog(filter) {
            const catalogList = document.getElementById('store-catalog-list');
            const installedIds = new Set(AppRegistry.getAll().map(a => a.id));
            const filterLower = (filter || '').toLowerCase();
            const filtered = filterLower
                ? STORE_CATALOG.filter(app =>
                    app.name.toLowerCase().includes(filterLower) ||
                    app.description.toLowerCase().includes(filterLower) ||
                    app.category.toLowerCase().includes(filterLower))
                : STORE_CATALOG;

            if (filtered.length === 0) {
                catalogList.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:14px">No apps match "' + escapeHtml(filter) + '"</div>';
                return;
            }

            const categories = [...new Set(filtered.map(app => app.category))];
            catalogList.innerHTML = categories.map(category => {
                const catApps = filtered.filter(app => app.category === category);
                const catMeta = CATEGORY_META[category] ?? { icon: '' };
                return '<div style="margin-bottom:20px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
                    '<div style="width:18px;height:18px;color:var(--text-secondary)">' + catMeta.icon + '</div>' +
                    '<span style="font-size:13px;font-weight:700;color:var(--text-primary)">' + escapeHtml(category) + '</span>' +
                    '<span style="font-size:11px;color:var(--text-muted)">(' + catApps.length + ')</span>' +
                    '</div>' +
                    catApps.map(app => {
                        const isInstalled = installedIds.has(app.id);
                        const isBuiltIn   = app.builtIn === true;
                        const iconBg = appIconColor(app.name);

                        let btnLabel, btnDisabled, btnExtraStyle;
                        if (isBuiltIn) {
                            btnLabel      = 'Built-in';
                            btnDisabled   = true;
                            btnExtraStyle = 'opacity:0.55;color:var(--text-muted)';
                        } else if (isInstalled) {
                            btnLabel      = '✓ Done';
                            btnDisabled   = true;
                            btnExtraStyle = 'opacity:0.55';
                        } else {
                            btnLabel      = 'Install';
                            btnDisabled   = false;
                            btnExtraStyle = '';
                        }

                        return '<div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;padding:10px 12px">' +
                            '<div style="width:52px;height:52px;border-radius:14px;background:' + iconBg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px ' + iconBg + '66;color:white;padding:10px">' +
                            app.icon + '</div>' +
                            '<div style="flex:1;min-width:0">' +
                            '<div style="font-size:15px;font-weight:700;color:var(--text-primary)">' + escapeHtml(app.name) + '</div>' +
                            '<div style="font-size:11px;color:var(--text-muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(app.description) + '</div>' +
                            '<div style="display:flex;align-items:center;gap:5px;margin-top:3px">' +
                            '<span style="font-size:11px;color:#f59e0b">' + renderStars(app.rating) + '</span>' +
                            '<span style="font-size:10px;color:var(--text-muted)">' + app.rating + ' · ' + app.downloads + '</span>' +
                            '</div></div>' +
                            '<button class="store-install-btn pz-btn secondary" data-id="' + app.id + '" data-path="' + (app.filePath || app.id) + '" data-name="' + escapeHtml(app.name) + '" ' +
                            (btnDisabled ? 'disabled ' : '') +
                            'style="flex-shrink:0;padding:7px 14px;font-size:12px;font-weight:700;' + btnExtraStyle + '">' +
                            btnLabel + '</button>' +
                            '</div>';
                    }).join('') +
                    '</div>';
            }).join('');

            catalogList.querySelectorAll('.store-install-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => installCatalogApp(btn.dataset.id, btn.dataset.path, btn.dataset.name, btn));
            });
        }

        renderCatalog('');
        document.getElementById('store-search').addEventListener('input', e => renderCatalog(e.target.value));
    }

    async function installCatalogApp(appId, filePath, appName, btn) {
        const originalLabel = btn.textContent;
        btn.textContent = '…';
        btn.disabled = true;
        try {
            // @vite-ignore: dynamic path — resolved at runtime by the dev server
            await import(/* @vite-ignore */ './' + filePath + '.js');
            window.PocketZero?.buildHomeScreen();
            btn.textContent = '✓ Done';
            btn.classList.add('secondary');
            btn.style.opacity = '0.5';
            Notify.show(appName + ' installed');
        } catch (err) {
            console.error('Install error:', err);
            Notify.show('Could not install ' + appName);
            btn.textContent = originalLabel;
            btn.disabled = false;
        }
    }

    // ── Custom ─────────────────────────────────────────────────────────────────

    function renderCustomTab(body) {
        body.style.padding = '12px';
        body.innerHTML = `
            <!-- URL Loader -->
            <div class="card" style="margin-bottom:10px">
                <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Load from URL</div>
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.5">
                    Paste a link to a <code style="background:var(--bg-tertiary);padding:1px 4px;border-radius:3px">.js</code> file
                    (e.g. a raw GitHub URL). The code is fetched and loaded into the editor below.
                </div>
                <div style="display:flex;gap:8px">
                    <input id="custom-url-input" class="pz-input" placeholder="https://raw.githubusercontent.com/…/myapp.js" style="flex:1;font-size:12px"/>
                    <button class="pz-btn" id="custom-url-load" style="flex-shrink:0;padding:10px 14px;font-size:13px">Fetch</button>
                </div>
                <div id="custom-url-status" style="margin-top:6px;font-size:12px;color:var(--text-muted);display:none"></div>
            </div>

            <!-- Code editor -->
            <div class="card" style="margin-bottom:10px">
                <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Code Editor</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;line-height:1.5">
                    Write or paste JS below. Call <code style="background:var(--bg-tertiary);padding:1px 5px;border-radius:4px;font-size:11px">AppRegistry.register({…})</code>
                    to add an app. One file can register <strong>multiple apps</strong>.
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;display:flex;flex-wrap:wrap;gap:4px">
                    <span style="color:var(--text-secondary);font-weight:600;margin-right:2px">Globals:</span>
                    ${['AppRegistry','Store','Router','Notify','Dialog','EventBus','Badge','Sound','Http'].map(
                        n => '<code style="background:var(--bg-tertiary);padding:1px 5px;border-radius:3px;font-size:11px">' + n + '</code>'
                    ).join('')}
                </div>
                <textarea id="custom-app-code" class="pz-input" spellcheck="false"
                    placeholder="// Example:\nAppRegistry.register({\n  id: 'hello',\n  name: 'Hello',\n  icon: '<svg viewBox=&quot;0 0 48 48&quot;>…</svg>',\n  removable: true,\n  render(container) {\n    container.innerHTML = '<p style=&quot;padding:20px&quot;>Hello!</p>';\n  }\n});"
                    style="font-family:monospace;font-size:12px;min-height:200px;resize:vertical;line-height:1.5;tab-size:2"></textarea>
                <div style="display:flex;gap:8px;margin-top:10px">
                    <button class="pz-btn" id="run-custom-app" style="flex:1">▶ Run &amp; Install</button>
                    <label class="pz-btn secondary" style="cursor:pointer;flex:1;text-align:center;display:flex;align-items:center;justify-content:center;gap:5px">
                        Load File
                        <input type="file" id="custom-app-file" accept=".js,text/javascript" style="display:none"/>
                    </label>
                    <button class="pz-btn secondary" id="clear-custom-code" style="padding:10px 12px">✕</button>
                </div>
                <div id="custom-app-error" style="margin-top:8px;font-size:12px;color:#ef4444;background:rgba(239,68,68,0.08);padding:8px;border-radius:6px;display:none;white-space:pre-wrap;word-break:break-word"></div>
            </div>

            <!-- Template -->
            <div class="card">
                <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:6px">Starter Template</div>
                <pre style="font-size:11px;color:var(--text-secondary);background:var(--bg-tertiary);padding:12px;border-radius:8px;overflow-x:auto;line-height:1.6;white-space:pre-wrap;margin:0">AppRegistry.register({
  id: 'myapp',
  name: 'My App',
  removable: true,
  icon: \`&lt;svg viewBox="0 0 48 48" fill="none"
    stroke="currentColor" stroke-width="2.5"
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
                <div style="margin-top:8px;font-size:11px;color:var(--text-muted);line-height:1.5">
                    <strong>Bundle tip:</strong> Call <code style="background:var(--bg-tertiary);padding:1px 4px;border-radius:3px">AppRegistry.register()</code> multiple times in one file to install several apps at once.
                </div>
            </div>`;

        // URL fetch
        const urlInput  = document.getElementById('custom-url-input');
        const urlStatus = document.getElementById('custom-url-status');

        document.getElementById('custom-url-load').addEventListener('click', async () => {
            const url = urlInput.value.trim();
            if (!url) return;
            urlStatus.style.display = 'block';
            urlStatus.style.color = 'var(--text-muted)';
            urlStatus.textContent = '⏳ Fetching…';
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('HTTP ' + response.status + ' ' + response.statusText);
                const codeText = await response.text();
                document.getElementById('custom-app-code').value = codeText;
                urlStatus.style.color = '#22c55e';
                urlStatus.textContent = '✓ Loaded ' + codeText.length.toLocaleString() + ' chars. Press "Run & Install" to install.';
            } catch (err) {
                urlStatus.style.color = '#ef4444';
                urlStatus.textContent = '✗ ' + err.message + '. Make sure the URL allows CORS (e.g. raw.githubusercontent.com works).';
            }
        });

        urlInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('custom-url-load').click();
        });

        // File loader
        document.getElementById('custom-app-file').addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = evt => {
                document.getElementById('custom-app-code').value = evt.target.result;
                urlStatus.style.display = 'block';
                urlStatus.style.color = '#22c55e';
                urlStatus.textContent = '✓ Loaded "' + file.name + '"';
            };
            reader.readAsText(file);
        });

        // Clear
        document.getElementById('clear-custom-code').addEventListener('click', () => {
            document.getElementById('custom-app-code').value = '';
            document.getElementById('custom-app-error').style.display = 'none';
        });

        // Run
        document.getElementById('run-custom-app').addEventListener('click', () => {
            const code = document.getElementById('custom-app-code').value.trim();
            const errorEl = document.getElementById('custom-app-error');
            errorEl.style.display = 'none';
            if (!code) { errorEl.textContent = 'No code to run.'; errorEl.style.display = 'block'; return; }
            try {
                const countBefore = AppRegistry.getAll().length;
                const wrappedFn = new Function(
                    'AppRegistry','Store','Router','Notify','Dialog','EventBus','Badge','Sound','Http',
                    code
                );
                wrappedFn(AppRegistry, Store, Router, Notify, Dialog, EventBus, Badge, Sound, Http);
                const newCount = AppRegistry.getAll().length - countBefore;
                window.PocketZero?.buildHomeScreen();
                Notify.show(newCount > 0 ? newCount + ' app' + (newCount > 1 ? 's' : '') + ' installed' : 'Code ran (no new apps registered)');
            } catch (err) {
                errorEl.textContent = 'Error: ' + err.message + '\n\n' + (err.stack ?? '');
                errorEl.style.display = 'block';
            }
        });
    }

    // ── Manage ─────────────────────────────────────────────────────────────────

    function renderManageTab(body) {
        body.style.padding = '12px';
        const allApps      = AppRegistry.getAll();
        const installedApps = allApps.filter(app => app.removable);
        const builtInApps   = allApps.filter(app => !app.removable);

        body.innerHTML = `
            <div class="card" style="margin-bottom:10px">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary)">Installed Apps</div>
                    <span style="font-size:12px;font-weight:700;background:var(--bg-tertiary);padding:2px 8px;border-radius:10px;color:var(--text-muted)">${installedApps.length}</span>
                </div>
                ${installedApps.length === 0
                    ? '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0">No third-party apps yet.<br><span style="font-size:11px">Browse the catalog or use the Custom tab.</span></div>'
                    : installedApps.map(app => `
                        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
                            <div style="width:38px;height:38px;border-radius:10px;background:${appIconColor(app.name)};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;color:white">
                                <div style="width:22px;height:22px">${app.icon}</div>
                            </div>
                            <span style="flex:1;font-size:15px;font-weight:600;color:var(--text-primary)">${escapeHtml(app.name)}</span>
                            <button class="pz-btn secondary remove-app-btn" data-id="${app.id}"
                                style="padding:6px 12px;font-size:12px;color:#ef4444;border-color:#ef4444">Remove</button>
                        </div>`).join('')
                }
            </div>
            <div class="card">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary)">Built-in Apps</div>
                    <span style="font-size:12px;font-weight:700;background:var(--bg-tertiary);padding:2px 8px;border-radius:10px;color:var(--text-muted)">${builtInApps.length}</span>
                </div>
                ${builtInApps.map(app => `
                    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
                        <div style="width:38px;height:38px;border-radius:10px;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--text-secondary)">
                            <div style="width:22px;height:22px">${app.icon}</div>
                        </div>
                        <span style="flex:1;font-size:15px;font-weight:600;color:var(--text-primary)">${escapeHtml(app.name)}</span>
                        <span style="font-size:11px;font-weight:600;color:var(--text-muted);background:var(--bg-tertiary);padding:3px 8px;border-radius:8px">Built-in</span>
                    </div>`).join('')}
            </div>`;

        body.querySelectorAll('.remove-app-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const appId = btn.dataset.id;
                const appName = AppRegistry.getById(appId)?.name ?? appId;
                AppRegistry.remove(appId);
                window.PocketZero?.buildHomeScreen();
                Notify.show(appName + ' removed');
                renderManageTab(body);
            });
        });
    }
}
