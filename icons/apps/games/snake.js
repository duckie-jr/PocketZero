import { AppRegistry } from '../registry.js';
import { Router } from '../router.js';
import { Store } from '../store.js';
import { ICON_SNAKE, ICON_BACK } from '../../icons/svg.js';

AppRegistry.register({
    id: 'snake',
    name: 'Snake',
    icon: ICON_SNAKE,
    removable: false,
    render: renderSnake,
});

function renderSnake(container) {
    const highScore = Store.get('snake-highscore') ?? 0;

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="snake-back">${ICON_BACK}</button>
            <span class="app-chrome-title">Snake</span>
            <span id="snake-score-display" style="font-size:14px;font-weight:600;color:var(--text-secondary);padding-right:8px">Best: ${highScore}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;padding:16px;background:var(--bg-primary)">
            <div style="display:flex;justify-content:space-between;width:100%;max-width:420px">
                <span style="font-size:13px;color:var(--text-secondary)">Score: <strong id="snake-score">0</strong></span>
                <span style="font-size:13px;color:var(--text-secondary)">Best: <strong id="snake-best">${highScore}</strong></span>
            </div>
            <canvas id="snake-canvas" style="border-radius:12px;max-width:100%"></canvas>
            <div id="snake-overlay" style="position:absolute;display:flex;flex-direction:column;align-items:center;gap:12px">
                <div id="snake-message" style="font-size:20px;font-weight:600;color:var(--text-primary)">Snake</div>
                <button class="pz-btn" id="snake-start-btn">Start Game</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,48px);grid-template-rows:repeat(2,48px);gap:6px;margin-top:8px">
                <div></div>
                <button class="pz-btn secondary snake-dpad" data-dir="UP" style="padding:0;width:48px;height:48px;font-size:20px">↑</button>
                <div></div>
                <button class="pz-btn secondary snake-dpad" data-dir="LEFT" style="padding:0;width:48px;height:48px;font-size:20px">←</button>
                <button class="pz-btn secondary snake-dpad" data-dir="DOWN" style="padding:0;width:48px;height:48px;font-size:20px">↓</button>
                <button class="pz-btn secondary snake-dpad" data-dir="RIGHT" style="padding:0;width:48px;height:48px;font-size:20px">→</button>
            </div>
        </div>
    `;

    document.getElementById('snake-back').addEventListener('click', () => {
        stopGame();
        Router.home();
    });

    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');

    const CELL = 20;
    const COLS = 20;
    const ROWS = 16;
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;

    let snake, direction, nextDirection, food, score, gameLoop, gameRunning;

    function startGame() {
        snake = [{ x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 }];
        direction = 'RIGHT';
        nextDirection = 'RIGHT';
        score = 0;
        gameRunning = true;
        document.getElementById('snake-overlay').style.display = 'none';
        document.getElementById('snake-score').textContent = '0';
        placeFood();

        let speed = 150;
        function tick() {
            if (!gameRunning) return;
            direction = nextDirection;
            moveSnake();
            if (checkCollision()) {
                endGame();
                return;
            }
            if (snake[0].x === food.x && snake[0].y === food.y) {
                score++;
                document.getElementById('snake-score').textContent = score;
                placeFood();
                speed = Math.max(70, speed - 2);
            } else {
                snake.pop();
            }
            draw();
            gameLoop = setTimeout(tick, speed);
        }
        tick();
    }

    function stopGame() {
        gameRunning = false;
        clearTimeout(gameLoop);
    }

    function endGame() {
        gameRunning = false;
        clearTimeout(gameLoop);
        const currentBest = Store.get('snake-highscore') ?? 0;
        if (score > currentBest) {
            Store.set('snake-highscore', score);
            document.getElementById('snake-best').textContent = score;
            document.getElementById('snake-score-display').textContent = `Best: ${score}`;
        }
        const overlay = document.getElementById('snake-overlay');
        document.getElementById('snake-message').textContent = `Game Over — Score: ${score}`;
        document.getElementById('snake-start-btn').textContent = 'Play Again';
        overlay.style.display = 'flex';
    }

    function placeFood() {
        do {
            food = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS),
            };
        } while (snake.some((seg) => seg.x === food.x && seg.y === food.y));
    }

    function moveSnake() {
        const head = { ...snake[0] };
        if (direction === 'UP') head.y--;
        if (direction === 'DOWN') head.y++;
        if (direction === 'LEFT') head.x--;
        if (direction === 'RIGHT') head.x++;
        snake.unshift(head);
    }

    function checkCollision() {
        const head = snake[0];
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return true;
        return snake.slice(1).some((seg) => seg.x === head.x && seg.y === head.y);
    }

    function draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? '#1c1c1e' : '#f2f2f7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 0.5;
        for (let col = 0; col <= COLS; col++) {
            ctx.beginPath(); ctx.moveTo(col * CELL, 0); ctx.lineTo(col * CELL, canvas.height); ctx.stroke();
        }
        for (let row = 0; row <= ROWS; row++) {
            ctx.beginPath(); ctx.moveTo(0, row * CELL); ctx.lineTo(canvas.width, row * CELL); ctx.stroke();
        }

        // Food
        ctx.fillStyle = '#ff3b30';
        ctx.beginPath();
        ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Snake
        snake.forEach((seg, index) => {
            const lightness = isDark
                ? `hsl(211,100%,${60 - index * 1.5}%)`
                : `hsl(211,100%,${45 - index * 1}%)`;
            ctx.fillStyle = index === 0 ? '#0a84ff' : lightness;
            ctx.beginPath();
            ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
            ctx.fill();
        });
    }

    const OPPOSITE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

    document.getElementById('snake-start-btn').addEventListener('click', startGame);

    container.querySelectorAll('.snake-dpad').forEach((btn) => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.dir;
            if (dir !== OPPOSITE[direction]) nextDirection = dir;
        });
    });

    document.addEventListener('keydown', handleKey);
    function handleKey(e) {
        const map = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
        const dir = map[e.key];
        if (dir && dir !== OPPOSITE[direction]) {
            e.preventDefault();
            nextDirection = dir;
        }
    }

    // Swipe support
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            const dir = dx > 0 ? 'RIGHT' : 'LEFT';
            if (dir !== OPPOSITE[direction]) nextDirection = dir;
        } else {
            const dir = dy > 0 ? 'DOWN' : 'UP';
            if (dir !== OPPOSITE[direction]) nextDirection = dir;
        }
    }, { passive: true });

    // Draw empty board initially
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#1c1c1e' : '#f2f2f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clean up listener when app closes
    const originalHome = Router.home.bind(Router);
}
