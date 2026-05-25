import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { ICON_CLOCK, ICON_BACK } from '../icons/svg.js';

AppRegistry.register({
    id: 'clock',
    name: 'Clock',
    icon: ICON_CLOCK,
    removable: false,
    render: renderClock,
});

function renderClock(container) {
    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="clock-back">${ICON_BACK}</button>
            <span class="app-chrome-title">Clock</span>
            <span style="width:36px"></span>
        </div>
        <div class="tab-bar">
            <button class="tab-bar-btn active" data-tab="clock">Clock</button>
            <button class="tab-bar-btn" data-tab="stopwatch">Stopwatch</button>
            <button class="tab-bar-btn" data-tab="timer">Timer</button>
            <button class="tab-bar-btn" data-tab="pomodoro">Pomodoro</button>
        </div>
        <div class="app-body" id="clock-body"></div>
    `;

    document.getElementById('clock-back').addEventListener('click', () => Router.home());

    const tabs = container.querySelectorAll('.tab-bar-btn');
    const body = document.getElementById('clock-body');
    let activeTab = 'clock';
    let clockInterval = null;

    function switchTab(tabName) {
        activeTab = tabName;
        tabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabName));
        if (clockInterval) clearInterval(clockInterval);
        body.innerHTML = '';

        if (tabName === 'clock') renderAnalogClock(body);
        if (tabName === 'stopwatch') renderStopwatch(body);
        if (tabName === 'timer') renderTimer(body);
        if (tabName === 'pomodoro') renderPomodoro(body);
    }

    tabs.forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    switchTab('clock');
}

// ── Analog + Digital Clock ────────────────────────────────────
function renderAnalogClock(body) {
    body.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px">
            <svg id="analog-clock" viewBox="0 0 200 200" width="180" height="180"
                 fill="none" stroke="currentColor" stroke-linecap="round"
                 xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="95" stroke-width="3"/>
                ${[...Array(12)].map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x1 = 100 + 82 * Math.cos(angle);
                    const y1 = 100 + 82 * Math.sin(angle);
                    const x2 = 100 + 90 * Math.cos(angle);
                    const y2 = 100 + 90 * Math.sin(angle);
                    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="2.5"/>`;
                }).join('')}
                <line id="hand-hour" x1="100" y1="100" x2="100" y2="45" stroke-width="4" stroke="currentColor"/>
                <line id="hand-minute" x1="100" y1="100" x2="100" y2="30" stroke-width="2.5" stroke="currentColor"/>
                <line id="hand-second" x1="100" y1="100" x2="100" y2="22" stroke-width="1.5" stroke="#0a84ff"/>
                <circle cx="100" cy="100" r="4" fill="currentColor" stroke="none"/>
            </svg>
            <div id="digital-clock" style="font-size:36px;font-weight:200;letter-spacing:2px;color:var(--text-primary)"></div>
            <div id="clock-date-display" style="font-size:14px;color:var(--text-secondary)"></div>
        </div>
    `;

    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourAngle = ((hours % 12) + minutes / 60) * 30 - 90;
        const minuteAngle = (minutes + seconds / 60) * 6 - 90;
        const secondAngle = seconds * 6 - 90;

        function setHand(id, angle, length) {
            const rad = angle * (Math.PI / 180);
            const x2 = (100 + length * Math.cos(rad)).toFixed(1);
            const y2 = (100 + length * Math.sin(rad)).toFixed(1);
            const line = document.getElementById(id);
            if (line) { line.setAttribute('x2', x2); line.setAttribute('y2', y2); }
        }

        setHand('hand-hour', hourAngle, 45);
        setHand('hand-minute', minuteAngle, 60);
        setHand('hand-second', secondAngle, 68);

        const timeEl = document.getElementById('digital-clock');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const dateEl = document.getElementById('clock-date-display');
        if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    body.dataset.interval = interval;
}

// ── Stopwatch ─────────────────────────────────────────────────
function renderStopwatch(body) {
    let elapsedMs = 0;
    let startTimestamp = null;
    let running = false;
    let animFrame = null;
    const laps = [];

    body.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:24px">
            <div id="sw-display" style="font-size:52px;font-weight:200;letter-spacing:2px;font-variant-numeric:tabular-nums">00:00.00</div>
            <div style="display:flex;gap:12px">
                <button class="pz-btn secondary" id="sw-lap">Lap</button>
                <button class="pz-btn" id="sw-start">Start</button>
                <button class="pz-btn secondary" id="sw-reset">Reset</button>
            </div>
            <div id="sw-laps" style="width:100%;display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto"></div>
        </div>
    `;

    function formatTime(ms) {
        const totalCentiseconds = Math.floor(ms / 10);
        const cs = totalCentiseconds % 100;
        const totalSeconds = Math.floor(totalCentiseconds / 100);
        const secs = totalSeconds % 60;
        const mins = Math.floor(totalSeconds / 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    }

    function tick() {
        elapsedMs = Date.now() - startTimestamp;
        document.getElementById('sw-display').textContent = formatTime(elapsedMs);
        animFrame = requestAnimationFrame(tick);
    }

    document.getElementById('sw-start').addEventListener('click', () => {
        const btn = document.getElementById('sw-start');
        if (!running) {
            startTimestamp = Date.now() - elapsedMs;
            running = true;
            btn.textContent = 'Stop';
            btn.className = 'pz-btn danger';
            animFrame = requestAnimationFrame(tick);
        } else {
            running = false;
            cancelAnimationFrame(animFrame);
            btn.textContent = 'Start';
            btn.className = 'pz-btn';
        }
    });

    document.getElementById('sw-lap').addEventListener('click', () => {
        if (!running) return;
        laps.unshift(formatTime(elapsedMs));
        const lapsContainer = document.getElementById('sw-laps');
        lapsContainer.innerHTML = laps.map((lap, i) =>
            `<div style="display:flex;justify-content:space-between;font-size:14px;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border)">
                <span>Lap ${laps.length - i}</span><span>${lap}</span>
            </div>`
        ).join('');
    });

    document.getElementById('sw-reset').addEventListener('click', () => {
        running = false;
        cancelAnimationFrame(animFrame);
        elapsedMs = 0;
        laps.length = 0;
        document.getElementById('sw-display').textContent = '00:00.00';
        document.getElementById('sw-laps').innerHTML = '';
        document.getElementById('sw-start').textContent = 'Start';
        document.getElementById('sw-start').className = 'pz-btn';
    });
}

// ── Countdown Timer ───────────────────────────────────────────
function renderTimer(body) {
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let timerInterval = null;
    let running = false;

    body.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:24px">
            <div style="display:flex;gap:8px;align-items:center">
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                    <button class="pz-btn secondary" id="timer-h-up" style="padding:6px 14px">+</button>
                    <div id="timer-h-val" style="font-size:32px;font-weight:200;width:60px;text-align:center">00</div>
                    <button class="pz-btn secondary" id="timer-h-down" style="padding:6px 14px">-</button>
                    <span style="font-size:11px;color:var(--text-muted)">hr</span>
                </div>
                <span style="font-size:32px;font-weight:200;padding-bottom:18px">:</span>
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                    <button class="pz-btn secondary" id="timer-m-up" style="padding:6px 14px">+</button>
                    <div id="timer-m-val" style="font-size:32px;font-weight:200;width:60px;text-align:center">00</div>
                    <button class="pz-btn secondary" id="timer-m-down" style="padding:6px 14px">-</button>
                    <span style="font-size:11px;color:var(--text-muted)">min</span>
                </div>
                <span style="font-size:32px;font-weight:200;padding-bottom:18px">:</span>
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                    <button class="pz-btn secondary" id="timer-s-up" style="padding:6px 14px">+</button>
                    <div id="timer-s-val" style="font-size:32px;font-weight:200;width:60px;text-align:center">00</div>
                    <button class="pz-btn secondary" id="timer-s-down" style="padding:6px 14px">-</button>
                    <span style="font-size:11px;color:var(--text-muted)">sec</span>
                </div>
            </div>
            <div id="timer-display" style="font-size:48px;font-weight:200;letter-spacing:3px;display:none">00:00:00</div>
            <div style="display:flex;gap:12px">
                <button class="pz-btn" id="timer-start">Start</button>
                <button class="pz-btn secondary" id="timer-reset">Reset</button>
            </div>
        </div>
    `;

    let hours = 0, minutes = 0, seconds = 0;

    function updatePickerDisplay() {
        document.getElementById('timer-h-val').textContent = String(hours).padStart(2, '0');
        document.getElementById('timer-m-val').textContent = String(minutes).padStart(2, '0');
        document.getElementById('timer-s-val').textContent = String(seconds).padStart(2, '0');
    }

    document.getElementById('timer-h-up').addEventListener('click', () => { hours = (hours + 1) % 24; updatePickerDisplay(); });
    document.getElementById('timer-h-down').addEventListener('click', () => { hours = (hours - 1 + 24) % 24; updatePickerDisplay(); });
    document.getElementById('timer-m-up').addEventListener('click', () => { minutes = (minutes + 1) % 60; updatePickerDisplay(); });
    document.getElementById('timer-m-down').addEventListener('click', () => { minutes = (minutes - 1 + 60) % 60; updatePickerDisplay(); });
    document.getElementById('timer-s-up').addEventListener('click', () => { seconds = (seconds + 1) % 60; updatePickerDisplay(); });
    document.getElementById('timer-s-down').addEventListener('click', () => { seconds = (seconds - 1 + 60) % 60; updatePickerDisplay(); });

    function beep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [0, 0.3, 0.6].forEach((delay) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                oscillator.frequency.value = 880;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.4, ctx.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
                oscillator.start(ctx.currentTime + delay);
                oscillator.stop(ctx.currentTime + delay + 0.25);
            });
        } catch {}
    }

    function formatTimerDisplay(secs) {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    document.getElementById('timer-start').addEventListener('click', () => {
        const btn = document.getElementById('timer-start');
        if (!running) {
            totalSeconds = hours * 3600 + minutes * 60 + seconds;
            if (totalSeconds === 0) return;
            remainingSeconds = totalSeconds;
            running = true;
            btn.textContent = 'Pause';
            btn.className = 'pz-btn danger';
            document.getElementById('timer-display').style.display = 'block';
            document.getElementById('timer-display').textContent = formatTimerDisplay(remainingSeconds);
            timerInterval = setInterval(() => {
                remainingSeconds--;
                document.getElementById('timer-display').textContent = formatTimerDisplay(remainingSeconds);
                if (remainingSeconds <= 0) {
                    clearInterval(timerInterval);
                    running = false;
                    btn.textContent = 'Start';
                    btn.className = 'pz-btn';
                    beep();
                }
            }, 1000);
        } else {
            clearInterval(timerInterval);
            running = false;
            btn.textContent = 'Resume';
            btn.className = 'pz-btn';
        }
    });

    document.getElementById('timer-reset').addEventListener('click', () => {
        clearInterval(timerInterval);
        running = false;
        remainingSeconds = 0;
        hours = 0; minutes = 0; seconds = 0;
        updatePickerDisplay();
        document.getElementById('timer-display').style.display = 'none';
        document.getElementById('timer-start').textContent = 'Start';
        document.getElementById('timer-start').className = 'pz-btn';
    });
}

// ── Pomodoro ──────────────────────────────────────────────────
function renderPomodoro(body) {
    const WORK_SECONDS = 25 * 60;
    const BREAK_SECONDS = 5 * 60;
    let remainingSeconds = WORK_SECONDS;
    let isWorkPhase = true;
    let sessionCount = Store.get('pomodoro-sessions') ?? 0;
    let running = false;
    let pomInterval = null;

    body.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px">
            <div id="pom-phase" style="font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--accent)">Work</div>
            <div id="pom-display" style="font-size:60px;font-weight:200;letter-spacing:3px">25:00</div>
            <div id="pom-sessions" style="font-size:13px;color:var(--text-secondary)">Sessions completed: ${sessionCount}</div>
            <div style="display:flex;gap:12px">
                <button class="pz-btn" id="pom-start">Start</button>
                <button class="pz-btn secondary" id="pom-skip">Skip</button>
                <button class="pz-btn secondary" id="pom-reset">Reset</button>
            </div>
        </div>
    `;

    function formatPom(secs) {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function tick() {
        remainingSeconds--;
        document.getElementById('pom-display').textContent = formatPom(remainingSeconds);
        if (remainingSeconds <= 0) {
            clearInterval(pomInterval);
            running = false;
            document.getElementById('pom-start').textContent = 'Start';
            document.getElementById('pom-start').className = 'pz-btn';
            if (isWorkPhase) {
                sessionCount++;
                Store.set('pomodoro-sessions', sessionCount);
                document.getElementById('pom-sessions').textContent = `Sessions completed: ${sessionCount}`;
            }
            isWorkPhase = !isWorkPhase;
            remainingSeconds = isWorkPhase ? WORK_SECONDS : BREAK_SECONDS;
            document.getElementById('pom-phase').textContent = isWorkPhase ? 'Work' : 'Break';
            document.getElementById('pom-display').textContent = formatPom(remainingSeconds);
        }
    }

    document.getElementById('pom-start').addEventListener('click', () => {
        const btn = document.getElementById('pom-start');
        if (!running) {
            running = true;
            btn.textContent = 'Pause';
            btn.className = 'pz-btn danger';
            pomInterval = setInterval(tick, 1000);
        } else {
            running = false;
            clearInterval(pomInterval);
            btn.textContent = 'Resume';
            btn.className = 'pz-btn';
        }
    });

    document.getElementById('pom-skip').addEventListener('click', () => {
        clearInterval(pomInterval);
        running = false;
        isWorkPhase = !isWorkPhase;
        remainingSeconds = isWorkPhase ? WORK_SECONDS : BREAK_SECONDS;
        document.getElementById('pom-phase').textContent = isWorkPhase ? 'Work' : 'Break';
        document.getElementById('pom-display').textContent = formatPom(remainingSeconds);
        document.getElementById('pom-start').textContent = 'Start';
        document.getElementById('pom-start').className = 'pz-btn';
    });

    document.getElementById('pom-reset').addEventListener('click', () => {
        clearInterval(pomInterval);
        running = false;
        isWorkPhase = true;
        remainingSeconds = WORK_SECONDS;
        document.getElementById('pom-phase').textContent = 'Work';
        document.getElementById('pom-display').textContent = formatPom(remainingSeconds);
        document.getElementById('pom-start').textContent = 'Start';
        document.getElementById('pom-start').className = 'pz-btn';
    });
}
