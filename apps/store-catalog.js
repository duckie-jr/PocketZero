// Each entry describes an app available in the Store.
// For catalog apps, `id` must match the filename in apps/ so the dynamic import works.
// Built-in apps (builtIn: true) are always installed — the catalog just lists them for discovery.

export const STORE_CATALOG = [
    // ── Games ─────────────────────────────────────────────────
    {
        id: 'snake',
        name: 'Snake',
        emoji: '🐍',
        category: 'Games',
        description: 'Classic snake game. Eat food, grow longer, don\'t hit the walls.',
        version: '1.0.0',
        rating: 4.7,
        downloads: '20k',
        filePath: 'games/snake',
        builtIn: true,   // pre-installed, no install button needed
    },
    {
        id: 'wordle',
        name: 'Wordle',
        filePath: 'games/wordle',
        emoji: '🟩',
        category: 'Games',
        description: 'Guess the 5-letter word in 6 tries. Color-coded hints after each guess.',
        version: '1.0.0',
        rating: 4.8,
        downloads: '12k',
    },
    {
        id: 'game2048',
        name: '2048',
        filePath: 'games/game2048',
        emoji: '🧩',
        category: 'Games',
        description: 'Slide tiles to combine matching numbers and reach 2048.',
        version: '1.0.0',
        rating: 4.6,
        downloads: '9.4k',
    },
    {
        id: 'tictactoe',
        name: 'Tic Tac Toe',
        filePath: 'games/tictactoe',
        emoji: '✖️',
        category: 'Games',
        description: 'Classic 3×3 grid game against an unbeatable minimax AI.',
        version: '1.0.0',
        rating: 4.3,
        downloads: '7.1k',
    },
    {
        id: 'minesweeper',
        name: 'Minesweeper',
        filePath: 'games/minesweeper',
        emoji: '💣',
        category: 'Games',
        description: 'Reveal all safe cells without hitting a mine. Tap to dig, toggle to flag.',
        version: '1.0.0',
        rating: 4.5,
        downloads: '8.2k',
    },
    // ── Productivity ──────────────────────────────────────────
    {
        id: 'habittracker',
        name: 'Habits',
        emoji: '🔥',
        category: 'Productivity',
        description: 'Build daily habits and track streaks. Never miss a day.',
        version: '1.0.0',
        rating: 4.7,
        downloads: '15k',
    },
    // ── Utilities ─────────────────────────────────────────────
    {
        id: 'unitconverter',
        name: 'Converter',
        emoji: '⇄',
        category: 'Utilities',
        description: 'Convert length, weight, temperature and speed across all major units.',
        version: '1.0.0',
        rating: 4.4,
        downloads: '11k',
    },
    {
        id: 'tipcalc',
        name: 'Tip Calc',
        emoji: '💸',
        category: 'Utilities',
        description: 'Split bills and calculate tips instantly. Supports any party size.',
        version: '1.0.0',
        rating: 4.6,
        downloads: '6.8k',
    },
];

export const CATEGORY_META = {
    Games:       { emoji: '🎮', color: '#8b5cf6' },
    Productivity:{ emoji: '📋', color: '#22c55e' },
    Utilities:   { emoji: '🔧', color: '#f59e0b' },
};
