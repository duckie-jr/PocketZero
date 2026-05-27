import { AppRegistry } from '../registry.js';
import { Router } from '../router.js';
import { Store } from '../store.js';

const ICON_2048 = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="40" height="40" rx="8" fill="#f59563"/>
  <text x="24" y="31" font-size="15" font-weight="900" text-anchor="middle" fill="white" font-family="system-ui,sans-serif">2048</text>
</svg>`;

const TILE_COLORS = {
    0:    { bg: 'rgba(0,0,0,0.06)', fg: 'transparent' },
    2:    { bg: '#eee4da', fg: '#776e65' },
    4:    { bg: '#ede0c8', fg: '#776e65' },
    8:    { bg: '#f2b179', fg: '#f9f6f2' },
    16:   { bg: '#f59563', fg: '#f9f6f2' },
    32:   { bg: '#f67c5f', fg: '#f9f6f2' },
    64:   { bg: '#f65e3b', fg: '#f9f6f2' },
    128:  { bg: '#edcf72', fg: '#f9f6f2' },
    256:  { bg: '#edcc61', fg: '#f9f6f2' },
    512:  { bg: '#edc850', fg: '#f9f6f2' },
    1024: { bg: '#edc53f', fg: '#f9f6f2' },
    2048: { bg: '#edc22e', fg: '#f9f6f2' },
};

AppRegistry.register({
    id: 'game2048',
    name: '2048',
    icon: ICON_2048,
    removable: true,
    render: render2048,
});

function render2048(container) {
    const SIZE = 4;
    let grid, score, bestScore;

    bestScore = Store.get('2048-best') ?? 0;

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="g2048-back">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="app-chrome-title">2048</span>
            <button class="app-chrome-btn" id="g2048-new" style="font-size:11px;font-weight:700">NEW</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:12px;gap:10px;background:var(--bg-primary);overflow:hidden">
            <div style="display:flex;gap:12px;align-items:center">
                <div style="background:var(--bg-tertiary);border-radius:8px;padding:6px 16px;text-align:center">
                    <div style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:1px">SCORE</div>
                    <div id="g2048-score" style="font-size:20px;font-weight:800;color:var(--text-primary)">0</div>
                </div>
                <div style="background:var(--bg-tertiary);border-radius:8px;padding:6px 16px;text-align:center">
                    <div style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:1px">BEST</div>
                    <div id="g2048-best" style="font-size:20px;font-weight:800;color:var(--text-primary)">${bestScore}</div>
                </div>
            </div>
            <div id="g2048-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#bbada0;padding:8px;border-radius:10px;width:min(280px,90vw);aspect-ratio:1/1"></div>
            <div id="g2048-msg" style="font-size:14px;font-weight:700;color:var(--accent);min-height:20px"></div>
            <div style="font-size:12px;color:var(--text-muted);text-align:center">Arrow keys or swipe to move</div>
        </div>`;

    document.getElementById('g2048-back').onclick = () => Router.home();
    document.getElementById('g2048-new').onclick = () => startNewGame();

    const boardEl = document.getElementById('g2048-board');
    const scoreEl = document.getElementById('g2048-score');
    const bestEl = document.getElementById('g2048-best');
    const msgEl = document.getElementById('g2048-msg');
    let tileEls = [];

    function buildTileElements() {
        boardEl.innerHTML = '';
        tileEls = [];
        for (let i = 0; i < SIZE * SIZE; i++) {
            const tile = document.createElement('div');
            tile.style.cssText = 'border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;transition:background 0.1s;aspect-ratio:1/1';
            boardEl.appendChild(tile);
            tileEls.push(tile);
        }
    }

    function startNewGame() {
        grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        score = 0;
        msgEl.textContent = '';
        buildTileElements();
        spawnTile();
        spawnTile();
        renderGrid();
    }

    function spawnTile() {
        const emptySlots = [];
        grid.forEach((row, r) => row.forEach((value, c) => {
            if (value === 0) emptySlots.push([r, c]);
        }));
        if (emptySlots.length === 0) return;
        const [r, c] = emptySlots[Math.floor(Math.random() * emptySlots.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function renderGrid() {
        scoreEl.textContent = score;
        bestEl.textContent = bestScore;
        grid.forEach((row, r) => row.forEach((value, c) => {
            const tile = tileEls[r * SIZE + c];
            const colorScheme = TILE_COLORS[value] ?? { bg: '#3c3a32', fg: '#f9f6f2' };
            const fontSize = value >= 1024 ? '14px' : value >= 128 ? '18px' : '22px';
            tile.style.background = colorScheme.bg;
            tile.style.color = colorScheme.fg;
            tile.style.fontSize = fontSize;
            tile.textContent = value > 0 ? String(value) : '';
        }));
    }

    function slideAndMergeRow(row) {
        const nonZero = row.filter(v => v !== 0);
        const merged = [];
        let skipNext = false;

        for (let i = 0; i < nonZero.length; i++) {
            if (skipNext) { skipNext = false; continue; }
            if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
                const mergedValue = nonZero[i] * 2;
                merged.push(mergedValue);
                score += mergedValue;
                skipNext = true;
            } else {
                merged.push(nonZero[i]);
            }
        }

        while (merged.length < SIZE) merged.push(0);
        return merged;
    }

    function moveLeft()  { return grid.map(row => slideAndMergeRow(row)); }
    function moveRight() { return grid.map(row => slideAndMergeRow([...row].reverse()).reverse()); }

    function moveUp() {
        const newGrid = grid.map(row => [...row]);
        for (let c = 0; c < SIZE; c++) {
            const column = grid.map(row => row[c]);
            slideAndMergeRow(column).forEach((value, r) => { newGrid[r][c] = value; });
        }
        return newGrid;
    }

    function moveDown() {
        const newGrid = grid.map(row => [...row]);
        for (let c = 0; c < SIZE; c++) {
            const column = grid.map(row => row[c]).reverse();
            slideAndMergeRow(column).reverse().forEach((value, r) => { newGrid[r][c] = value; });
        }
        return newGrid;
    }

    function gridsAreEqual(a, b) {
        return a.every((row, r) => row.every((value, c) => value === b[r][c]));
    }

    function applyMove(newGrid) {
        if (gridsAreEqual(grid, newGrid)) return;
        grid = newGrid;
        if (score > bestScore) { bestScore = score; Store.set('2048-best', bestScore); }
        spawnTile();
        renderGrid();
        checkGameState();
    }

    function checkGameState() {
        if (grid.some(row => row.includes(2048))) { msgEl.textContent = '🎉 You reached 2048!'; return; }
        const hasEmpty = grid.some(row => row.includes(0));
        if (hasEmpty) return;
        const canMergeH = grid.some(row => row.some((v, c) => c < SIZE - 1 && v === row[c + 1]));
        const canMergeV = grid.some((row, r) => r < SIZE - 1 && row.some((v, c) => v === grid[r + 1][c]));
        if (!canMergeH && !canMergeV) msgEl.textContent = '💥 Game Over';
    }

    const keydownHandler = (e) => {
        const moves = { ArrowLeft: moveLeft, ArrowRight: moveRight, ArrowUp: moveUp, ArrowDown: moveDown };
        if (moves[e.key]) { e.preventDefault(); applyMove(moves[e.key]()); }
    };
    document.addEventListener('keydown', keydownHandler);

    let touchStartX = 0, touchStartY = 0;
    boardEl.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    boardEl.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
        if (Math.abs(dx) > Math.abs(dy)) applyMove(dx > 0 ? moveRight() : moveLeft());
        else applyMove(dy > 0 ? moveDown() : moveUp());
    }, { passive: true });

    const cleanupObserver = new MutationObserver(() => {
        if (!container.isConnected) { document.removeEventListener('keydown', keydownHandler); cleanupObserver.disconnect(); }
    });
    cleanupObserver.observe(document.body, { childList: true, subtree: true });

    startNewGame();
}
