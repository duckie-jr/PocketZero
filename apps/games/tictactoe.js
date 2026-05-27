import { AppRegistry } from '../registry.js';
import { Router } from '../router.js';
import { Store } from '../store.js';

const ICON_TICTACTOE = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="3" stroke-linecap="round">
  <line x1="16" y1="4" x2="16" y2="44"/>
  <line x1="32" y1="4" x2="32" y2="44"/>
  <line x1="4" y1="16" x2="44" y2="16"/>
  <line x1="4" y1="32" x2="44" y2="32"/>
  <line x1="6" y1="6" x2="13" y2="13"/>
  <line x1="13" y1="6" x2="6" y2="13"/>
  <circle cx="38" cy="9.5" r="3.5"/>
  <circle cx="9.5" cy="38" r="3.5"/>
</svg>`;

const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
];

function checkWinner(board) {
    for (const [a, b, c] of WIN_LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line: [a, b, c] };
        }
    }
    return null;
}

function minimax(board, isMaximizing) {
    const result = checkWinner(board);
    if (result?.winner === 'O') return 10;
    if (result?.winner === 'X') return -10;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        board.forEach((cell, i) => {
            if (cell !== null) return;
            board[i] = 'O';
            best = Math.max(best, minimax(board, false));
            board[i] = null;
        });
        return best;
    } else {
        let best = Infinity;
        board.forEach((cell, i) => {
            if (cell !== null) return;
            board[i] = 'X';
            best = Math.min(best, minimax(board, true));
            board[i] = null;
        });
        return best;
    }
}

function getBestAiMove(board) {
    let bestScore = -Infinity;
    let bestIndex = -1;
    board.forEach((cell, i) => {
        if (cell !== null) return;
        board[i] = 'O';
        const moveScore = minimax(board, false);
        board[i] = null;
        if (moveScore > bestScore) { bestScore = moveScore; bestIndex = i; }
    });
    return bestIndex;
}

AppRegistry.register({
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    icon: ICON_TICTACTOE,
    removable: true,
    render: renderTicTacToe,
});

function renderTicTacToe(container) {
    let board = Array(9).fill(null);
    let playerTurn = true;
    let gameActive = true;
    const wins = Store.getOrDefault('ttt-wins', { player: 0, ai: 0, draw: 0 });

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="ttt-back">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="app-chrome-title">Tic Tac Toe</span>
            <button class="app-chrome-btn" id="ttt-new" style="font-size:11px;font-weight:700">NEW</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:16px;background:var(--bg-primary)">
            <div style="display:flex;gap:24px">
                <div style="text-align:center">
                    <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted)">YOU (X)</div>
                    <div id="ttt-wins-display" style="font-size:28px;font-weight:800;color:#22c55e">${wins.player}</div>
                </div>
                <div style="text-align:center">
                    <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted)">DRAW</div>
                    <div id="ttt-draws-display" style="font-size:28px;font-weight:800;color:var(--text-secondary)">${wins.draw}</div>
                </div>
                <div style="text-align:center">
                    <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted)">AI (O)</div>
                    <div id="ttt-losses-display" style="font-size:28px;font-weight:800;color:#ef4444">${wins.ai}</div>
                </div>
            </div>
            <div id="ttt-status" style="font-size:14px;font-weight:600;color:var(--text-secondary)">Your turn (X)</div>
            <div id="ttt-board" style="display:grid;grid-template-columns:repeat(3,90px);grid-template-rows:repeat(3,90px);gap:8px"></div>
        </div>`;

    document.getElementById('ttt-back').onclick = () => Router.home();
    document.getElementById('ttt-new').onclick = () => resetGame();

    const boardEl = document.getElementById('ttt-board');
    const statusEl = document.getElementById('ttt-status');

    function buildBoard() {
        boardEl.innerHTML = '';
        board.forEach((cellValue, index) => {
            const cell = document.createElement('button');
            cell.style.cssText = 'border-radius:12px;background:var(--bg-secondary);border:2px solid var(--border);font-size:36px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s';
            cell.textContent = cellValue ?? '';
            cell.style.color = cellValue === 'X' ? '#22c55e' : '#ef4444';
            if (gameActive && playerTurn && cellValue === null) {
                cell.onclick = () => handlePlayerMove(index);
                cell.onmouseenter = () => { cell.style.background = 'var(--bg-tertiary)'; };
                cell.onmouseleave = () => { cell.style.background = 'var(--bg-secondary)'; };
            }
            boardEl.appendChild(cell);
        });
    }

    function handlePlayerMove(index) {
        if (!gameActive || !playerTurn || board[index] !== null) return;
        board[index] = 'X';
        playerTurn = false;
        buildBoard();
        if (evaluateGameState()) return;
        statusEl.textContent = 'AI thinking…';
        setTimeout(() => {
            const aiIndex = getBestAiMove([...board]);
            board[aiIndex] = 'O';
            playerTurn = true;
            buildBoard();
            if (!evaluateGameState()) statusEl.textContent = 'Your turn (X)';
        }, 300);
    }

    function evaluateGameState() {
        const result = checkWinner(board);
        if (result) {
            gameActive = false;
            highlightWinLine(result.line);
            if (result.winner === 'X') {
                statusEl.textContent = '🎉 You win!';
                wins.player++;
            } else {
                statusEl.textContent = '🤖 AI wins!';
                wins.ai++;
            }
            Store.set('ttt-wins', wins);
            updateScoreboard();
            return true;
        }
        if (board.every(cell => cell !== null)) {
            gameActive = false;
            statusEl.textContent = "It's a draw!";
            wins.draw++;
            Store.set('ttt-wins', wins);
            updateScoreboard();
            return true;
        }
        return false;
    }

    function highlightWinLine(line) {
        const cells = boardEl.children;
        line.forEach(index => {
            cells[index].style.background = '#fef08a';
            cells[index].style.borderColor = '#eab308';
        });
    }

    function updateScoreboard() {
        document.getElementById('ttt-wins-display').textContent = wins.player;
        document.getElementById('ttt-draws-display').textContent = wins.draw;
        document.getElementById('ttt-losses-display').textContent = wins.ai;
    }

    function resetGame() {
        board = Array(9).fill(null);
        playerTurn = true;
        gameActive = true;
        statusEl.textContent = 'Your turn (X)';
        buildBoard();
    }

    buildBoard();
}
