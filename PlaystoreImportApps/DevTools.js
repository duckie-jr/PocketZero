// APIs injected by the Play Store runner:
// AppRegistry, Store, Router, Notify, Dialog, EventBus, Badge, Sound, Http

const ICON_BACK = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="30,12 18,24 30,36"/></svg>`;

const ICON_DEV = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.6 16.6l4.6-4.6-4.6-4.6 1.4-1.4 6 6-6 6zM9.4 16.6l-4.6-4.6 4.6-4.6-1.4-1.4-6 6 6 6z"/>
</svg>`;

AppRegistry.register({
    id: 'devtools',
    name: 'Dev Tools',
    icon: ICON_DEV,
    removable: true,
    render: renderDevTools,
});

// Isolated namespace — keeps devtools keys separate from all other app data
const devStore = Store.namespace('devtools');

const TAB_NAMES = ['store', 'dialog', 'events', 'sound', 'http', 'system'];

function renderDevTools(container) {
    let activeTab = 'store';
    // Holds Store.subscribe() unsubscribe functions so we can clean up on exit
    const subscriptionCleanups = [];

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="dev-back">${ICON_BACK}</button>
            <span class="app-chrome-title">Dev Tools</span>
            <span id="dev-tab-label" style="font-size:11px;color:var(--accent);padding-right:8px;font-weight:600">STORE</span>
        </div>
        <div id="dev-tabs" style="display:flex;overflow-x:auto;background:var(--bg-secondary);border-bottom:1px solid var(--border);padding:0 8px;gap:2px;scrollbar-width:none;">
            ${TAB_NAMES.map(name => `
                <button data-tab="${name}" style="background:none;border:none;border-bottom:2px solid transparent;padding:10px 12px 8px;font-size:12px;font-weight:600;font-family:var(--font);cursor:pointer;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-secondary);white-space:nowrap;transition:color 0.15s,border-color 0.15s;">${name}</button>
            `).join('')}
        </div>
        <div id="dev-panel" class="app-body" style="overflow-y:auto;padding:16px;gap:12px;"></div>
    `;

    container.querySelector('#dev-back').addEventListener('click', () => {
        subscriptionCleanups.forEach(unsub => unsub());
        Router.home();
    });

    const tabButtons = container.querySelectorAll('#dev-tabs button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            refreshTabStyles();
            renderPanel();
        });
    });

    function refreshTabStyles() {
        tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === activeTab;
            btn.style.color = isActive ? 'var(--accent)' : 'var(--text-secondary)';
            btn.style.borderBottomColor = isActive ? 'var(--accent)' : 'transparent';
        });
        const labelEl = container.querySelector('#dev-tab-label');
        if (labelEl) labelEl.textContent = activeTab.toUpperCase();
    }

    function renderPanel() {
        const panel = container.querySelector('#dev-panel');
        panel.innerHTML = '';
        if (activeTab === 'store')  renderStoreTab(panel, subscriptionCleanups);
        if (activeTab === 'dialog') renderDialogTab(panel);
        if (activeTab === 'events') renderEventsTab(panel);
        if (activeTab === 'sound')  renderSoundTab(panel);
        if (activeTab === 'http')   renderHttpTab(panel);
        if (activeTab === 'system') renderSystemTab(panel);
    }

    refreshTabStyles();
    renderPanel();
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function card(title, bodyHtml) {
    return `
        <div class="card" style="display:flex;flex-direction:column;gap:10px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--accent)">${title}</div>
            ${bodyHtml}
        </div>
    `;
}

function codeBox(id, initial = '') {
    return `<pre id="${id}" style="background:var(--bg-tertiary);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--text-secondary);font-family:monospace;overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin:0;min-height:32px;">${initial || '—'}</pre>`;
}

function rowBtns(html) {
    return `<div style="display:flex;gap:8px;flex-wrap:wrap;">${html}</div>`;
}

function mkBtn(id, label) {
    return `<button id="${id}" class="pz-btn" style="flex:1;">${label}</button>`;
}

// ── Store Tab ─────────────────────────────────────────────────────────────────

function renderStoreTab(panel, subscriptionCleanups) {
    panel.innerHTML = `
        ${card('set / get / has / remove', `
            <div style="display:flex;gap:8px;">
                <input class="pz-input" id="s-key" placeholder="key" value="myKey" style="flex:1;min-width:0;"/>
                <input class="pz-input" id="s-val" placeholder="value" value="hello" style="flex:1;min-width:0;"/>
            </div>
            ${rowBtns(mkBtn('s-set','set') + mkBtn('s-get','get') + mkBtn('s-has','has?') + mkBtn('s-rm','remove'))}
            ${codeBox('s-result')}
        `)}
        ${card('increment / decrement / toggle', `
            ${rowBtns(mkBtn('s-inc','++ counter') + mkBtn('s-dec','-- counter') + mkBtn('s-tog','toggle flag'))}
            ${codeBox('s-atomic')}
        `)}
        ${card('push / pop array', `
            <input class="pz-input" id="s-push-val" placeholder="item to push" value="newItem"/>
            ${rowBtns(mkBtn('s-push','push') + mkBtn('s-pop','pop'))}
            ${codeBox('s-arr')}
        `)}
        ${card('subscribe (live)', `
            <p style="font-size:12px;color:var(--text-secondary);margin:0;">Watching key <code style="color:var(--accent)">devtools:watchMe</code></p>
            <input class="pz-input" id="s-watch-val" placeholder="value to write"/>
            ${rowBtns(mkBtn('s-watch-w','write') + mkBtn('s-watch-rm','remove'))}
            ${codeBox('s-sub', 'waiting for write...')}
        `)}
        ${card('TTL — 5 second expiry', `
            ${rowBtns(mkBtn('s-ttl-w','write (5s TTL)') + mkBtn('s-ttl-r','read'))}
            ${codeBox('s-ttl')}
        `)}
        ${card('getAll / clear namespace', `
            ${rowBtns(mkBtn('s-all','getAll') + mkBtn('s-clr','clear namespace'))}
            ${codeBox('s-all-result')}
        `)}
    `;

    const resultEl   = panel.querySelector('#s-result');
    const atomicEl   = panel.querySelector('#s-atomic');
    const arrEl      = panel.querySelector('#s-arr');
    const subEl      = panel.querySelector('#s-sub');
    const ttlEl      = panel.querySelector('#s-ttl');
    const allEl      = panel.querySelector('#s-all-result');

    const getKey = () => panel.querySelector('#s-key').value.trim() || 'myKey';
    const getVal = () => panel.querySelector('#s-val').value;

    panel.querySelector('#s-set').addEventListener('click', () => {
        devStore.set(getKey(), getVal());
        resultEl.textContent = `set("${getKey()}", "${getVal()}") → OK`;
        Sound.click();
    });
    panel.querySelector('#s-get').addEventListener('click', () => {
        resultEl.textContent = `get("${getKey()}") → ${JSON.stringify(devStore.get(getKey()))}`;
    });
    panel.querySelector('#s-has').addEventListener('click', () => {
        resultEl.textContent = `has("${getKey()}") → ${devStore.has(getKey())}`;
    });
    panel.querySelector('#s-rm').addEventListener('click', () => {
        devStore.remove(getKey());
        resultEl.textContent = `remove("${getKey()}") → OK`;
        Sound.click();
    });

    panel.querySelector('#s-inc').addEventListener('click', () => {
        atomicEl.textContent = `increment("counter") → ${devStore.increment('counter')}`;
    });
    panel.querySelector('#s-dec').addEventListener('click', () => {
        atomicEl.textContent = `decrement("counter") → ${devStore.decrement('counter')}`;
    });
    panel.querySelector('#s-tog').addEventListener('click', () => {
        atomicEl.textContent = `toggle("flag") → ${devStore.toggle('flag')}`;
    });

    panel.querySelector('#s-push').addEventListener('click', () => {
        const item = panel.querySelector('#s-push-val').value || 'item';
        arrEl.textContent = `push("list", "${item}") → ${JSON.stringify(devStore.push('list', item))}`;
    });
    panel.querySelector('#s-pop').addEventListener('click', () => {
        const popped = devStore.pop('list');
        arrEl.textContent = `pop("list") → ${JSON.stringify(popped)}\nlist now → ${JSON.stringify(devStore.get('list') ?? [])}`;
    });

    const unsub = devStore.subscribe('watchMe', (newVal) => {
        subEl.textContent = `callback fired → ${JSON.stringify(newVal)}`;
        Sound.notify();
    });
    subscriptionCleanups.push(unsub);

    panel.querySelector('#s-watch-w').addEventListener('click', () => {
        devStore.set('watchMe', panel.querySelector('#s-watch-val').value || 'live!');
    });
    panel.querySelector('#s-watch-rm').addEventListener('click', () => devStore.remove('watchMe'));

    panel.querySelector('#s-ttl-w').addEventListener('click', () => {
        devStore.set('ephemeral', `written at ${new Date().toLocaleTimeString()}`, { ttlMs: 5000 });
        ttlEl.textContent = 'Written — expires in 5s';
        Sound.success();
    });
    panel.querySelector('#s-ttl-r').addEventListener('click', () => {
        const value = devStore.get('ephemeral');
        ttlEl.textContent = value === null ? 'null (expired or not set)' : `"${value}"`;
    });

    panel.querySelector('#s-all').addEventListener('click', () => {
        allEl.textContent = JSON.stringify(devStore.getAll(), null, 2);
    });
    panel.querySelector('#s-clr').addEventListener('click', () => {
        devStore.clear();
        allEl.textContent = 'Namespace cleared';
        Sound.error();
    });
}

// ── Dialog Tab ────────────────────────────────────────────────────────────────

function renderDialogTab(panel) {
    panel.innerHTML = `
        ${card('Dialog.alert()', `
            <input class="pz-input" id="dlg-a-msg" value="Hello from Dev Tools!"/>
            ${rowBtns(mkBtn('dlg-alert', 'alert()'))}
        `)}
        ${card('Dialog.confirm()', `
            <input class="pz-input" id="dlg-c-msg" value="Are you sure?"/>
            ${rowBtns(mkBtn('dlg-confirm', 'confirm()'))}
            ${codeBox('dlg-c-result')}
        `)}
        ${card('Dialog.prompt()', `
            <div style="display:flex;gap:8px;">
                <input class="pz-input" id="dlg-p-msg" placeholder="message" value="Enter your name" style="flex:1;min-width:0;"/>
                <input class="pz-input" id="dlg-p-def" placeholder="default" value="World" style="flex:1;min-width:0;"/>
            </div>
            ${rowBtns(mkBtn('dlg-prompt', 'prompt()'))}
            ${codeBox('dlg-p-result')}
        `)}
    `;

    panel.querySelector('#dlg-alert').addEventListener('click', async () => {
        await Dialog.alert(panel.querySelector('#dlg-a-msg').value || 'Hello!');
        Sound.success();
    });

    panel.querySelector('#dlg-confirm').addEventListener('click', async () => {
        const confirmed = await Dialog.confirm(panel.querySelector('#dlg-c-msg').value || 'Sure?');
        panel.querySelector('#dlg-c-result').textContent = `confirm() → ${confirmed}`;
        confirmed ? Sound.success() : Sound.error();
    });

    panel.querySelector('#dlg-prompt').addEventListener('click', async () => {
        const input = await Dialog.prompt(
            panel.querySelector('#dlg-p-msg').value || 'Enter value',
            panel.querySelector('#dlg-p-def').value || ''
        );
        panel.querySelector('#dlg-p-result').textContent = `prompt() → ${JSON.stringify(input)}`;
        input !== null ? Sound.success() : Sound.error();
    });
}

// ── Events Tab ────────────────────────────────────────────────────────────────

function renderEventsTab(panel) {
    panel.innerHTML = `
        ${card('emit', `
            <div style="display:flex;gap:8px;">
                <input class="pz-input" id="ev-name" placeholder="event name" value="dev:ping" style="flex:1;min-width:0;"/>
                <input class="pz-input" id="ev-payload" placeholder="payload" value="hello" style="flex:1;min-width:0;"/>
            </div>
            ${rowBtns(mkBtn('ev-emit','EventBus.emit') + mkBtn('ev-emit-once','emit + once listener'))}
        `)}
        ${card('on / off', `
            <input class="pz-input" id="ev-sub-name" placeholder="event name" value="dev:ping"/>
            ${rowBtns(mkBtn('ev-on','on()') + mkBtn('ev-off','off()'))}
            ${codeBox('ev-sub-status', 'not subscribed')}
        `)}
        ${card('log', `
            ${rowBtns(mkBtn('ev-clr','clear log'))}
            ${codeBox('ev-log')}
        `)}
    `;

    let currentEventName = null;
    let currentHandler = null;
    const logLines = [];

    function appendLog(msg) {
        logLines.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
        if (logLines.length > 30) logLines.pop();
        panel.querySelector('#ev-log').textContent = logLines.join('\n') || '—';
    }

    panel.querySelector('#ev-emit').addEventListener('click', () => {
        const name = panel.querySelector('#ev-name').value || 'dev:ping';
        const payload = panel.querySelector('#ev-payload').value;
        EventBus.emit(name, payload);
        appendLog(`emitted "${name}" → ${JSON.stringify(payload)}`);
        Sound.click();
    });

    panel.querySelector('#ev-emit-once').addEventListener('click', () => {
        const name = panel.querySelector('#ev-name').value || 'dev:ping';
        const payload = panel.querySelector('#ev-payload').value;
        EventBus.once(name, (data) => appendLog(`once-listener "${name}" → ${JSON.stringify(data)}`));
        EventBus.emit(name, payload);
        appendLog(`emitted "${name}" with once-listener attached`);
        Sound.notify();
    });

    panel.querySelector('#ev-on').addEventListener('click', () => {
        const name = panel.querySelector('#ev-sub-name').value || 'dev:ping';
        if (currentHandler && currentEventName) EventBus.off(currentEventName, currentHandler);
        currentEventName = name;
        currentHandler = (data) => appendLog(`received "${name}" → ${JSON.stringify(data)}`);
        EventBus.on(name, currentHandler);
        panel.querySelector('#ev-sub-status').textContent = `subscribed to "${name}"`;
        Sound.success();
    });

    panel.querySelector('#ev-off').addEventListener('click', () => {
        if (currentHandler && currentEventName) {
            EventBus.off(currentEventName, currentHandler);
            panel.querySelector('#ev-sub-status').textContent = `unsubscribed from "${currentEventName}"`;
            appendLog(`unsubscribed from "${currentEventName}"`);
            currentHandler = null;
            currentEventName = null;
            Sound.click();
        }
    });

    panel.querySelector('#ev-clr').addEventListener('click', () => {
        logLines.length = 0;
        panel.querySelector('#ev-log').textContent = '—';
    });
}

// ── Sound Tab ─────────────────────────────────────────────────────────────────

function renderSoundTab(panel) {
    panel.innerHTML = `
        ${card('presets', `
            ${rowBtns(
                mkBtn('snd-beep','beep') +
                mkBtn('snd-click','click') +
                mkBtn('snd-success','success') +
                mkBtn('snd-error','error') +
                mkBtn('snd-notify','notify')
            )}
        `)}
        ${card('tone(freq, dur, gain)', `
            <div style="display:flex;gap:8px;">
                <input class="pz-input" id="snd-freq" type="number" value="440" placeholder="Hz" style="flex:1;min-width:0;"/>
                <input class="pz-input" id="snd-dur"  type="number" value="0.3" step="0.1" placeholder="sec" style="flex:1;min-width:0;"/>
                <input class="pz-input" id="snd-gain" type="number" value="0.3" step="0.05" placeholder="gain" style="flex:1;min-width:0;"/>
            </div>
            ${rowBtns(mkBtn('snd-tone','tone()'))}
        `)}
        ${card('chord(frequencies[])', `
            <input class="pz-input" id="snd-chord" placeholder="comma-separated Hz" value="261,329,392"/>
            ${rowBtns(mkBtn('snd-chord-play','chord()'))}
        `)}
    `;

    panel.querySelector('#snd-beep'   ).addEventListener('click', () => Sound.beep());
    panel.querySelector('#snd-click'  ).addEventListener('click', () => Sound.click());
    panel.querySelector('#snd-success').addEventListener('click', () => Sound.success());
    panel.querySelector('#snd-error'  ).addEventListener('click', () => Sound.error());
    panel.querySelector('#snd-notify' ).addEventListener('click', () => Sound.notify());

    panel.querySelector('#snd-tone').addEventListener('click', () => {
        const freq = parseFloat(panel.querySelector('#snd-freq').value) || 440;
        const dur  = parseFloat(panel.querySelector('#snd-dur').value)  || 0.3;
        const gain = parseFloat(panel.querySelector('#snd-gain').value) || 0.3;
        Sound.tone(freq, dur, gain);
    });

    panel.querySelector('#snd-chord-play').addEventListener('click', () => {
        const freqs = panel.querySelector('#snd-chord').value
            .split(',')
            .map(s => parseFloat(s.trim()))
            .filter(n => !isNaN(n));
        if (freqs.length > 0) Sound.chord(freqs);
    });
}

// ── HTTP Tab ──────────────────────────────────────────────────────────────────

function renderHttpTab(panel) {
    panel.innerHTML = `
        ${card('Http.get(url)', `
            <input class="pz-input" id="http-url" value="https://jsonplaceholder.typicode.com/todos/1"/>
            ${rowBtns(mkBtn('http-get','GET'))}
            ${codeBox('http-result')}
        `)}
        ${card('Http.post(url, body)', `
            <input class="pz-input" id="http-post-url" value="https://jsonplaceholder.typicode.com/posts"/>
            <textarea class="pz-input" id="http-post-body" rows="3" style="resize:vertical;font-family:monospace;font-size:12px;">${JSON.stringify({ title: 'Dev Tools Post', body: 'hello', userId: 1 }, null, 2)}</textarea>
            ${rowBtns(mkBtn('http-post','POST'))}
            ${codeBox('http-post-result')}
        `)}
    `;

    const getResultEl  = panel.querySelector('#http-result');
    const postResultEl = panel.querySelector('#http-post-result');

    panel.querySelector('#http-get').addEventListener('click', async () => {
        const url = panel.querySelector('#http-url').value.trim();
        getResultEl.textContent = 'loading...';
        try {
            const data = await Http.get(url);
            getResultEl.textContent = JSON.stringify(data, null, 2);
            Sound.success();
        } catch (err) {
            getResultEl.textContent = `Error: ${err.message}`;
            Sound.error();
        }
    });

    panel.querySelector('#http-post').addEventListener('click', async () => {
        const url = panel.querySelector('#http-post-url').value.trim();
        let body;
        try {
            body = JSON.parse(panel.querySelector('#http-post-body').value);
        } catch {
            postResultEl.textContent = 'Invalid JSON body';
            Sound.error();
            return;
        }
        postResultEl.textContent = 'loading...';
        try {
            const data = await Http.post(url, { body });
            postResultEl.textContent = JSON.stringify(data, null, 2);
            Sound.success();
        } catch (err) {
            postResultEl.textContent = `Error: ${err.message}`;
            Sound.error();
        }
    });
}

// ── System Tab ────────────────────────────────────────────────────────────────

function renderSystemTab(panel) {
    panel.innerHTML = `
        ${card('Notify.show()', `
            <div style="display:flex;gap:8px;">
                <input class="pz-input" id="sys-notify-msg" value="Hello from Dev Tools!" style="flex:1;min-width:0;"/>
                <input class="pz-input" id="sys-notify-dur" type="number" value="3000" placeholder="ms" style="width:80px;min-width:0;"/>
            </div>
            ${rowBtns(mkBtn('sys-notify','show'))}
        `)}
        ${card('Badge', `
            <div style="display:flex;gap:8px;">
                <input class="pz-input" id="badge-app" placeholder="appId" value="devtools" style="flex:1;min-width:0;"/>
                <input class="pz-input" id="badge-count" type="number" value="3" style="width:80px;min-width:0;"/>
            </div>
            ${rowBtns(mkBtn('badge-set','Badge.set') + mkBtn('badge-get','Badge.get') + mkBtn('badge-clr','Badge.clear'))}
            ${codeBox('badge-result')}
        `)}
        ${card('Router', `
            <input class="pz-input" id="router-app" placeholder="appId to open" value="calculator"/>
            ${rowBtns(mkBtn('router-open','Router.open') + mkBtn('router-home','Router.home'))}
        `)}
        ${card('AppRegistry.getAll()', `
            ${rowBtns(mkBtn('reg-all','getAll'))}
            ${codeBox('reg-result')}
        `)}
    `;

    panel.querySelector('#sys-notify').addEventListener('click', () => {
        const msg = panel.querySelector('#sys-notify-msg').value || 'Hello!';
        const dur = parseInt(panel.querySelector('#sys-notify-dur').value) || 3000;
        Notify.show(msg, dur);
        Sound.notify();
    });

    const badgeResultEl = panel.querySelector('#badge-result');
    panel.querySelector('#badge-set').addEventListener('click', () => {
        const appId = panel.querySelector('#badge-app').value || 'devtools';
        const count = parseInt(panel.querySelector('#badge-count').value) || 0;
        Badge.set(appId, count);
        badgeResultEl.textContent = `Badge.set("${appId}", ${count}) → OK`;
        Sound.click();
    });
    panel.querySelector('#badge-get').addEventListener('click', () => {
        const appId = panel.querySelector('#badge-app').value || 'devtools';
        badgeResultEl.textContent = `Badge.get("${appId}") → ${Badge.get(appId)}`;
    });
    panel.querySelector('#badge-clr').addEventListener('click', () => {
        Badge.clear();
        badgeResultEl.textContent = 'Badge.clear() → all badges removed';
        Sound.click();
    });

    panel.querySelector('#router-open').addEventListener('click', () => {
        Router.open(panel.querySelector('#router-app').value.trim() || 'calculator');
    });
    panel.querySelector('#router-home').addEventListener('click', () => Router.home());

    panel.querySelector('#reg-all').addEventListener('click', () => {
        const apps = AppRegistry.getAll().map(a => ({ id: a.id, name: a.name, removable: a.removable }));
        panel.querySelector('#reg-result').textContent = JSON.stringify(apps, null, 2);
    });
}
