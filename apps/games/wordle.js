import { AppRegistry } from '../registry.js';
import { Router } from '../router.js';
import { Store } from '../store.js';

const ICON_WORDLE = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="6" width="36" height="36" rx="3" stroke="#000000" stroke-width="4"/>
  <path d="M14 16L18 32L24 19L30 32L34 16" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const WORD_LIST = [
    'CRANE','SLATE','STORM','PLANE','GRAPE','BRAVE','FLUTE','GLOBE','SHARK','TIGER',
    'PIANO','CHAIR','FLAME','FROST','GHOST','PAINT','QUIRK','RIVER','SCORE','TOWER',
    'BLACK','CLOUD','DANCE','EARTH','FANCY','GRAIN','HOUSE','IMAGE','JEWEL','KNIFE',
    'LEMON','MAGIC','NIGHT','OCEAN','PRIZE','QUEEN','ROUND','SPACE','TRACE','VOICE',
    'WATER','YOUNG','ZEBRA','BLAST','CRISP','DEPOT','ELBOW','FLOCK','GLOOM','INPUT',
    'JOUST','KNACK','LODGE','MIRTH','ONSET','PLUMB','QUOTA','REACH','SHAKY','TRUNK',
];

AppRegistry.register({
    id: 'wordle',
    name: 'Wordle',
    icon: ICON_WORDLE,
    removable: true,
    render: renderWordle,
});

function renderWordle(container) {
    const target = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    let guesses = [];
    let currentGuess = '';
    let gameOver = false;
    const ROWS = 6;
    const COLS = 5;

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="wordle-back">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="app-chrome-title">Wordle</span>
            <button class="app-chrome-btn" id="wordle-new" style="font-size:11px;font-weight:700">NEW</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:12px 8px;gap:10px;overflow:auto;background:var(--bg-primary)">
            <div id="wordle-board" style="display:flex;flex-direction:column;gap:5px"></div>
            <div id="wordle-msg" style="font-size:13px;font-weight:600;color:var(--accent);min-height:20px;text-align:center"></div>
            <div id="wordle-keyboard" style="display:flex;flex-direction:column;gap:5px;align-items:center;width:100%;max-width:340px"></div>
        </div>`;

    document.getElementById('wordle-back').onclick = () => Router.home();
    document.getElementById('wordle-new').onclick = () => renderWordle(container);

    const boardEl = document.getElementById('wordle-board');
    const keyboardEl = document.getElementById('wordle-keyboard');
    const msgEl = document.getElementById('wordle-msg');

    const tileRows = Array.from({ length: ROWS }, () => {
        const rowEl = document.createElement('div');
        rowEl.style.cssText = 'display:flex;gap:5px';
        const tiles = Array.from({ length: COLS }, () => {
            const tile = document.createElement('div');
            tile.style.cssText = 'width:52px;height:52px;border:2px solid var(--border);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:var(--text-primary);transition:background 0.25s,border-color 0.25s';
            rowEl.appendChild(tile);
            return tile;
        });
        boardEl.appendChild(rowEl);
        return tiles;
    });

    const KEY_LAYOUT = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['↵','Z','X','C','V','B','N','M','⌫'],
    ];
    const keyElements = {};

    KEY_LAYOUT.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.style.cssText = 'display:flex;gap:4px;justify-content:center;width:100%';
        row.forEach(key => {
            const btn = document.createElement('button');
            btn.textContent = key;
            const isWide = key.length > 1;
            btn.style.cssText = `height:42px;min-width:${isWide ? '46' : '30'}px;flex:${isWide ? '1.4' : '1'};border-radius:5px;font-size:12px;font-weight:700;background:var(--bg-tertiary);color:var(--text-primary);border:none;cursor:pointer;transition:background 0.2s`;
            btn.onclick = () => handleKey(key);
            rowEl.appendChild(btn);
            keyElements[key] = btn;
        });
        keyboardEl.appendChild(rowEl);
    });

    function handleKey(key) {
        if (gameOver) return;
        if (key === '⌫' || key === 'Backspace') {
            currentGuess = currentGuess.slice(0, -1);
        } else if (key === '↵' || key === 'Enter') {
            submitGuess();
        } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < COLS) {
            currentGuess += key.toUpperCase();
        }
        refreshCurrentRow();
    }

    const keydownHandler = (e) => {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            handleKey(e.key);
        }
    };
    document.addEventListener('keydown', keydownHandler);

    const cleanupObserver = new MutationObserver(() => {
        if (!container.isConnected) {
            document.removeEventListener('keydown', keydownHandler);
            cleanupObserver.disconnect();
        }
    });
    cleanupObserver.observe(document.body, { childList: true, subtree: true });

    function submitGuess() {
        if (currentGuess.length < COLS) {
            msgEl.textContent = 'Need 5 letters';
            setTimeout(() => { if (!gameOver) msgEl.textContent = ''; }, 1200);
            return;
        }

        const guess = currentGuess;
        const result = scoreGuess(guess, target);
        const tilePalette = { correct: '#22c55e', present: '#eab308', absent: 'var(--bg-tertiary)' };
        const guessRow = tileRows[guesses.length];

        result.forEach((status, i) => {
            const tile = guessRow[i];
            tile.style.background = tilePalette[status];
            tile.style.borderColor = status === 'absent' ? 'transparent' : tilePalette[status];
            tile.style.color = status === 'absent' ? 'var(--text-muted)' : 'white';

            const keyBtn = keyElements[guess[i]];
            if (keyBtn) {
                const priority = { correct: 3, present: 2, absent: 1 };
                const existingPriority = parseInt(keyBtn.dataset.priority ?? '0');
                if (priority[status] > existingPriority) {
                    keyBtn.style.background = tilePalette[status];
                    keyBtn.style.color = status === 'absent' ? 'var(--text-muted)' : 'white';
                    keyBtn.dataset.priority = String(priority[status]);
                }
            }
        });

        guesses.push(guess);
        currentGuess = '';

        if (guess === target) {
            gameOver = true;
            const labels = ['Genius!','Magnificent!','Impressive!','Splendid!','Great!','Phew!'];
            msgEl.textContent = '🎉 ' + (labels[guesses.length - 1] ?? 'Nice!');
            Store.increment('wordle-wins');
            return;
        }

        if (guesses.length >= ROWS) {
            gameOver = true;
            msgEl.textContent = 'Answer: ' + target;
        }
    }

    function scoreGuess(guess, word) {
        const result = Array(COLS).fill('absent');
        const wordLetters = [...word];
        const guessLetters = [...guess];

        guessLetters.forEach((char, i) => {
            if (char === wordLetters[i]) {
                result[i] = 'correct';
                wordLetters[i] = null;
                guessLetters[i] = null;
            }
        });

        guessLetters.forEach((char, i) => {
            if (char === null) return;
            const matchIndex = wordLetters.indexOf(char);
            if (matchIndex !== -1) {
                result[i] = 'present';
                wordLetters[matchIndex] = null;
            }
        });

        return result;
    }

    function refreshCurrentRow() {
        const currentRowTiles = tileRows[guesses.length];
        if (!currentRowTiles) return;
        currentRowTiles.forEach((tile, i) => {
            tile.textContent = currentGuess[i] ?? '';
            tile.style.borderColor = currentGuess[i] ? 'var(--text-secondary)' : 'var(--border)';
        });
    }
}
