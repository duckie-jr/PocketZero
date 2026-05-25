import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { ICON_BROWSER, ICON_BACK, ICON_FORWARD, ICON_REFRESH, ICON_PLUS, ICON_TRASH, ICON_HOME } from '../icons/svg.js';

AppRegistry.register({
    id: 'browser',
    name: 'Browser',
    icon: ICON_BROWSER,
    removable: false,
    render: renderBrowser,
});

function normalizeUrl(input) {
    const trimmed = input.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^[\w-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderBrowser(container) {
    let bookmarks = Store.get('bookmarks') ?? [];
    const iframeHistory = [];
    const iframeForwardStack = [];

    container.innerHTML = `
        <div class="app-chrome" style="gap:4px;padding:0 8px">
            <button class="app-chrome-btn" id="br-exit">${ICON_BACK}</button>
            <button class="app-chrome-btn" id="br-back" style="opacity:0.3" disabled>${ICON_BACK}</button>
            <input class="pz-input" id="br-url"
                placeholder="Search or enter URL..."
                style="flex:1;font-size:13px;padding:6px 10px" />
            <button class="app-chrome-btn" id="br-forward" style="opacity:0.3" disabled>${ICON_FORWARD}</button>
            <button class="app-chrome-btn" id="br-refresh">${ICON_REFRESH}</button>
            <button class="app-chrome-btn" id="br-newtab">${ICON_HOME}</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative">
            <div id="br-newtab-screen" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;align-items:center">
                <div style="font-size:22px;font-weight:300;color:var(--text-primary)">PocketZero Browser</div>
                <div style="display:flex;gap:8px;width:100%;max-width:500px">
                    <input class="pz-input" id="br-bm-input" placeholder="Paste URL to bookmark..." style="flex:1;font-size:13px" />
                    <button class="pz-btn" id="br-bm-add" style="padding:10px 14px">${ICON_PLUS}</button>
                </div>
                <div style="width:100%;max-width:500px">
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:1px;margin-bottom:8px">BOOKMARKS</div>
                    <div id="br-bm-list"></div>
                </div>
            </div>
            <iframe id="br-frame"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                style="flex:1;border:none;display:none;width:100%;height:100%"
                title="PocketZero Browser"></iframe>
        </div>
    `;

    const urlInput   = document.getElementById('br-url');
    const iframe     = document.getElementById('br-frame');
    const newTabView = document.getElementById('br-newtab-screen');
    const backBtn    = document.getElementById('br-back');
    const fwdBtn     = document.getElementById('br-forward');

    // ── Navigation helpers ────────────────────────────────────
    function updateNavButtons() {
        const canGoBack = iframeHistory.length > 1;
        const canGoFwd  = iframeForwardStack.length > 0;
        backBtn.disabled    = !canGoBack;
        backBtn.style.opacity  = canGoBack ? '1' : '0.3';
        fwdBtn.disabled     = !canGoFwd;
        fwdBtn.style.opacity   = canGoFwd  ? '1' : '0.3';
    }

    function navigate(rawUrl) {
        const url = normalizeUrl(rawUrl);
        urlInput.value = url;
        iframeHistory.push(url);
        iframeForwardStack.length = 0;
        iframe.src = url;
        newTabView.style.display = 'none';
        iframe.style.display     = 'block';
        updateNavButtons();
    }

    function showNewTab() {
        iframe.style.display     = 'none';
        newTabView.style.display = 'flex';
        urlInput.value = '';
        updateNavButtons();
    }

    // ── Event listeners ───────────────────────────────────────
    document.getElementById('br-exit').addEventListener('click', () => Router.home());

    document.getElementById('br-newtab').addEventListener('click', showNewTab);

    document.getElementById('br-refresh').addEventListener('click', () => {
        if (iframe.style.display !== 'none' && iframe.src) {
            iframe.src = iframe.src;
        }
    });

    document.getElementById('br-back').addEventListener('click', () => {
        if (iframeHistory.length > 1) {
            iframeForwardStack.push(iframeHistory.pop());
            const prev = iframeHistory[iframeHistory.length - 1];
            urlInput.value = prev;
            iframe.src = prev;
            updateNavButtons();
        }
    });

    document.getElementById('br-forward').addEventListener('click', () => {
        if (iframeForwardStack.length > 0) {
            const next = iframeForwardStack.pop();
            iframeHistory.push(next);
            urlInput.value = next;
            iframe.src = next;
            updateNavButtons();
        }
    });

    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigate(urlInput.value);
    });

    // ── Bookmarks ─────────────────────────────────────────────
    document.getElementById('br-bm-add').addEventListener('click', () => {
        const raw = document.getElementById('br-bm-input').value.trim();
        if (!raw) return;
        const url = normalizeUrl(raw);
        if (!bookmarks.includes(url)) {
            bookmarks.push(url);
            Store.set('bookmarks', bookmarks);
            Notify.show('Bookmark saved');
        }
        document.getElementById('br-bm-input').value = '';
        renderBookmarks();
    });

    function renderBookmarks() {
        const list = document.getElementById('br-bm-list');
        if (!list) return;

        if (bookmarks.length === 0) {
            list.innerHTML = `<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:16px">No bookmarks yet</div>`;
            return;
        }

        list.innerHTML = bookmarks.map((url, index) => `
            <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;
                        background:var(--bg-secondary);border-radius:10px;
                        margin-bottom:6px;box-shadow:var(--shadow-sm)">
                <span class="bm-link" data-url="${escapeHtml(url)}"
                      style="flex:1;font-size:13px;color:var(--accent);cursor:pointer;
                             overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    ${escapeHtml(url)}
                </span>
                <button class="bm-delete" data-index="${index}"
                        style="background:none;border:none;cursor:pointer;
                               opacity:0.45;color:var(--text-primary);flex-shrink:0">
                    ${ICON_TRASH}
                </button>
            </div>
        `).join('');

        list.querySelectorAll('.bm-link').forEach((el) => {
            el.addEventListener('click', () => navigate(el.dataset.url));
        });

        list.querySelectorAll('.bm-delete').forEach((btn) => {
            btn.addEventListener('click', () => {
                bookmarks.splice(parseInt(btn.dataset.index), 1);
                Store.set('bookmarks', bookmarks);
                renderBookmarks();
            });
        });
    }

    renderBookmarks();
}
