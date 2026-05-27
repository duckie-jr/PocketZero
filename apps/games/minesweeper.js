import { AppRegistry } from '../registry.js';
import { Router } from '../router.js';
import { Store } from '../store.js';

const ICON_MINESWEEPER = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor"> <path d="M15.6,7.1a1.6,1.6,0,0,0,1.6-1.6v-2A1.6,1.6,0,0,0,15.6,2a1.5,1.5,0,0,0-1.5,1.5v2A1.6,1.6,0,0,0,15.6,7.1Z"/> <path d="M10.3,7.4a1.3,1.3,0,0,0,1,.4,1.5,1.5,0,0,0,1.1-.4,1.6,1.6,0,0,0,0-2.2L11,3.8a1.6,1.6,0,0,0-2.2,0,1.4,1.4,0,0,0,0,2.1Z"/> <path d="M11.1,10.6A1.5,1.5,0,0,0,9.6,9.1H7.5a1.5,1.5,0,0,0,0,3H9.6A1.5,1.5,0,0,0,11.1,10.6Z"/> <path d="M12.4,13.8a1.4,1.4,0,0,0-2.1,0L8.8,15.2a1.6,1.6,0,0,0,0,2.2,1.5,1.5,0,0,0,1.1.4,1.5,1.5,0,0,0,1.1-.4L12.4,16A1.6,1.6,0,0,0,12.4,13.8Z"/> <path d="M17.2,17.7v-2a1.6,1.6,0,0,0-1.6-1.6,1.6,1.6,0,0,0-1.5,1.6v2a1.5,1.5,0,0,0,1.5,1.5A1.6,1.6,0,0,0,17.2,17.7Z"/> <path d="M31.9,21V16.7H27.8V14.6a6,6,0,0,0-6.1-6H15.6a2,2,0,0,0,0,4h6.1a2,2,0,0,1,2.1,2v2.1H19.7V21a13.1,13.1,0,0,0-8.1,11.9c0,7.2,6.3,13.1,14.2,13.1S40,40.1,40,32.9A13.1,13.1,0,0,0,31.9,21ZM25.8,42c-5.6,0-10.2-4.1-10.2-9.1a9,9,0,0,1,5.7-8.2l2.5-1.1V20.7h4v2.9l2.4,1.1a8.9,8.9,0,0,1,5.7,8.2C35.9,37.9,31.4,42,25.8,42Z"/> </svg>`;

const GRID_COLS = 9;
const GRID_ROWS = 9;
const MINE_COUNT = 10;

AppRegistry.register({
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: ICON_MINESWEEPER,
    removable: true,
    render: renderMinesweeper,
});

function renderMinesweeper(container) {
    let cells = [];
    let mineLocations = new Set();
    let revealedCount = 0;
    let flagMode = false;
    let gameOver = false;
    let firstClick = true;
    let timerInterval = null;
    let elapsedSeconds = 0;

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="ms-back">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="app-chrome-title">Minesweeper</span>
            <button class="app-chrome-btn" id="ms-new" style="font-size:11px;font-weight:700">NEW</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:10px;gap:10px;background:var(--bg-primary);overflow:hidden">
            <div style="display:flex;align-items:center;gap:12px">
                <div style="background:var(--bg-tertiary);border-radius:8px;padding:5px 12px;display:flex;align-items:center;gap:4px">
                    <span style="font-size:16px">💣</span>
                    <span id="ms-mines" style="font-size:16px;font-weight:800;color:var(--text-primary)">${MINE_COUNT}</span>
                </div>
                <button id="ms-flag-toggle" style="background:var(--bg-tertiary);border:2px solid var(--border);border-radius:8px;padding:5px 14px;font-size:13px;cursor:pointer;font-weight:700;color:var(--text-primary);min-width:90px">
                    ⛏ Dig
                </button>
                <div style="background:var(--bg-tertiary);border-radius:8px;padding:5px 12px;display:flex;align-items:center;gap:4px">
                    <span style="font-size:16px">⏱</span>
                    <span id="ms-timer" style="font-size:16px;font-weight:800;color:var(--text-primary)">0</span>
                </div>
            </div>
            <div id="ms-board" style="display:grid;grid-template-columns:repeat(${GRID_COLS},1fr);gap:3px;width:min(320px,95vw)"></div>
            <div id="ms-msg" style="font-size:14px;font-weight:700;color:var(--accent);min-height:20px;text-align:center"></div>
        </div>`;

    document.getElementById('ms-back').onclick = () => { stopTimer(); Router.home(); };
    document.getElementById('ms-new').onclick = () => startGame();

    const flagToggleBtn = document.getElementById('ms-flag-toggle');
    flagToggleBtn.onclick = () => {
        flagMode = !flagMode;
        flagToggleBtn.textContent = flagMode ? '🚩 Flag' : '⛏ Dig';
        flagToggleBtn.style.background = flagMode ? '#ef4444' : 'var(--bg-tertiary)';
        flagToggleBtn.style.color = flagMode ? 'white' : 'var(--text-primary)';
        flagToggleBtn.style.borderColor = flagMode ? '#ef4444' : 'var(--border)';
    };

    const boardEl   = document.getElementById('ms-board');
    const minesEl   = document.getElementById('ms-mines');
    const timerEl   = document.getElementById('ms-timer');
    const msgEl     = document.getElementById('ms-msg');

    function startGame() {
        cells = []; mineLocations = new Set(); revealedCount = 0;
        flagMode = false; gameOver = false; firstClick = true;
        elapsedSeconds = 0; msgEl.textContent = ''; stopTimer();
        timerEl.textContent = '0'; minesEl.textContent = MINE_COUNT;
        flagToggleBtn.textContent = '⛏ Dig';
        flagToggleBtn.style.background = 'var(--bg-tertiary)';
        flagToggleBtn.style.color = 'var(--text-primary)';
        flagToggleBtn.style.borderColor = 'var(--border)';
        boardEl.innerHTML = '';

        for (let index = 0; index < GRID_ROWS * GRID_COLS; index++) {
            const cell = {
                index,
                row: Math.floor(index / GRID_COLS),
                col: index % GRID_COLS,
                isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
            };
            cells.push(cell);
            const btn = document.createElement('button');
            btn.style.cssText = 'aspect-ratio:1/1;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;min-width:0';
            btn.onclick = () => handleCellClick(index);
            btn.oncontextmenu = (e) => { e.preventDefault(); handleFlag(index); };
            boardEl.appendChild(btn);
            cell.el = btn;
        }
    }

    function placeMines(safeIndex) {
        const safeNeighbors = new Set(getNeighborIndices(safeIndex));
        safeNeighbors.add(safeIndex);
        while (mineLocations.size < MINE_COUNT) {
            const randomIndex = Math.floor(Math.random() * GRID_ROWS * GRID_COLS);
            if (!safeNeighbors.has(randomIndex)) mineLocations.add(randomIndex);
        }
        mineLocations.forEach(index => { cells[index].isMine = true; });
        cells.forEach(cell => {
            if (!cell.isMine) {
                cell.adjacentMines = getNeighborIndices(cell.index).filter(i => mineLocations.has(i)).length;
            }
        });
    }

    function getNeighborIndices(index) {
        const row = Math.floor(index / GRID_COLS);
        const col = index % GRID_COLS;
        const neighbors = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr; const nc = col + dc;
                if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
                    neighbors.push(nr * GRID_COLS + nc);
                }
            }
        }
        return neighbors;
    }

    function handleCellClick(index) {
        if (gameOver) return;
        if (flagMode) { handleFlag(index); return; }
        const cell = cells[index];
        if (cell.isFlagged || cell.isRevealed) return;
        if (firstClick) { firstClick = false; placeMines(index); startTimer(); }
        if (cell.isMine) {
            revealAllMines();
            gameOver = true; stopTimer();
            msgEl.textContent = '💥 Boom! Game over.';
            cell.el.style.background = '#ef4444';
            return;
        }
        floodReveal(index);
        checkWin();
    }

    function handleFlag(index) {
        if (gameOver) return;
        const cell = cells[index];
        if (cell.isRevealed) return;
        cell.isFlagged = !cell.isFlagged;
        cell.el.textContent = cell.isFlagged ? '🚩' : '';
        minesEl.textContent = MINE_COUNT - cells.filter(c => c.isFlagged).length;
    }

    const NUMBER_COLORS = ['','#2563eb','#16a34a','#ef4444','#7c3aed','#9a3412','#0891b2','#1f2937','#6b7280'];

    function floodReveal(index) {
        const cell = cells[index];
        if (cell.isRevealed || cell.isFlagged || cell.isMine) return;
        cell.isRevealed = true;
        revealedCount++;
        cell.el.style.background = 'var(--bg-secondary)';
        cell.el.style.borderColor = 'transparent';
        cell.el.textContent = cell.adjacentMines > 0 ? String(cell.adjacentMines) : '';
        cell.el.style.color = NUMBER_COLORS[cell.adjacentMines] ?? '';
        cell.el.style.fontSize = '11px';
        if (cell.adjacentMines === 0) {
            getNeighborIndices(index).forEach(neighborIndex => floodReveal(neighborIndex));
        }
    }

    function revealAllMines() {
        mineLocations.forEach(index => {
            const cell = cells[index];
            if (!cell.isFlagged) { cell.el.textContent = '💣'; cell.el.style.background = '#fca5a5'; }
        });
    }

    function checkWin() {
        if (revealedCount >= GRID_ROWS * GRID_COLS - MINE_COUNT) {
            gameOver = true; stopTimer();
            msgEl.textContent = '🎉 You won in ' + elapsedSeconds + 's!';
            Store.increment('minesweeper-wins');
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => { elapsedSeconds++; timerEl.textContent = elapsedSeconds; }, 1000);
    }

    function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    startGame();
}
