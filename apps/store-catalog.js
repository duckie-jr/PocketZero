// Each entry describes an app available in the Play Store.
// To add a new app to the catalog, add an entry here.
// The "code" field is the full JS module source that will be eval'd on install.

export const STORE_CATALOG = [
    {
        id: 'wordle',
        name: 'Wordle',
        category: 'Games',
        description: 'Guess the 5-letter word in 6 tries. Color-coded feedback each guess.',
        version: '1.0.0',
    },
    {
        id: 'game2048',
        name: '2048',
        category: 'Games',
        description: 'Slide tiles to combine them and reach 2048.',
        version: '1.0.0',
    },
    {
        id: 'tictactoe',
        name: 'Tic Tac Toe',
        category: 'Games',
        description: 'Classic 3x3 grid game vs a minimax AI.',
        version: '1.0.0',
    },
    {
        id: 'minesweeper',
        name: 'Minesweeper',
        category: 'Games',
        description: 'Reveal all safe cells without hitting a mine.',
        version: '1.0.0',
    },
    {
        id: 'habittracker',
        name: 'Habits',
        category: 'Productivity',
        description: 'Track daily habits and build streaks.',
        version: '1.0.0',
    },
    {
        id: 'unitconverter',
        name: 'Converter',
        category: 'Utilities',
        description: 'Convert length, weight, temperature and speed units.',
        version: '1.0.0',
    },
    {
        id: 'tipcalc',
        name: 'Tip Calc',
        category: 'Utilities',
        description: 'Split bills and calculate tips by party size.',
        version: '1.0.0',
    },
];
