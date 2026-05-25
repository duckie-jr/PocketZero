import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { ICON_CALCULATOR, ICON_BACK } from '../icons/svg.js';

AppRegistry.register({
    id: 'calculator',
    name: 'Calculator',
    icon: ICON_CALCULATOR,
    removable: false,
    render: renderCalculator,
});

function renderCalculator(container) {
    const history = Store.get('calc-history') ?? [];
    let displayValue = '0';
    let storedValue = null;
    let pendingOperator = null;
    let waitingForOperand = false;
    let isScientific = false;

    const standardButtons = [
        ['AC', '+/-', '%', '/'],
        ['7', '8', '9', '*'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '='],
    ];

    const scientificButtons = [
        ['sin', 'cos', 'tan', 'sqrt'],
        ['log', 'ln', 'pi', 'e'],
        ['x^2', 'x^3', '1/x', 'AC'],
    ];

    function buildLayout() {
        container.innerHTML = `
            <div class="app-chrome">
                <button class="app-chrome-btn" id="calc-back">${ICON_BACK}</button>
                <span class="app-chrome-title">Calculator</span>
                <button class="pz-btn secondary" id="calc-mode-toggle" style="padding:4px 10px;font-size:12px">${isScientific ? 'Standard' : 'Scientific'}</button>
            </div>
            <div style="display:flex;flex-direction:column;height:calc(100% - 48px)">
                <div style="padding:16px 20px;background:var(--bg-secondary);border-bottom:1px solid var(--border)">
                    <div id="calc-history-line" style="font-size:13px;color:var(--text-muted);text-align:right;min-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${history[0] ?? ''}</div>
                    <div id="calc-display" style="font-size:clamp(32px,6vw,52px);font-weight:200;text-align:right;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${displayValue}</div>
                </div>
                ${isScientific ? `
                <div id="sci-buttons" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border-bottom:1px solid var(--border)">
                    ${scientificButtons.flat().map((label) =>
                        `<button class="calc-btn sci-btn" data-action="${label}" style="padding:14px 4px;font-size:13px;font-weight:500;background:var(--bg-tertiary);color:var(--text-primary);border:none;cursor:pointer;transition:filter 0.1s">${formatLabel(label)}</button>`
                    ).join('')}
                </div>` : ''}
                <div id="std-buttons" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);flex:1">
                    ${standardButtons.flat().map((label) => {
                        const isOperator = ['/','*','-','+','='].includes(label);
                        const isSpecial = ['AC','+/-','%'].includes(label);
                        const isZero = label === '0';
                        const spanTwo = isZero ? 'grid-column:span 2' : '';
                        const bgColor = isOperator ? 'var(--accent)' : isSpecial ? 'var(--bg-tertiary)' : 'var(--bg-secondary)';
                        const color = isOperator ? '#fff' : 'var(--text-primary)';
                        return `<button class="calc-btn" data-action="${label}" style="${spanTwo};font-size:clamp(18px,3vw,24px);font-weight:${isOperator ? '600' : '400'};background:${bgColor};color:${color};border:none;cursor:pointer;transition:filter 0.1s">${formatLabel(label)}</button>`;
                    }).join('')}
                </div>
            </div>
        `;

        document.getElementById('calc-back').addEventListener('click', () => Router.home());
        document.getElementById('calc-mode-toggle').addEventListener('click', () => {
            isScientific = !isScientific;
            buildLayout();
        });

        container.querySelectorAll('.calc-btn').forEach((btn) => {
            btn.addEventListener('mousedown', () => { btn.style.filter = 'brightness(0.8)'; });
            btn.addEventListener('mouseup', () => { btn.style.filter = ''; });
            btn.addEventListener('mouseleave', () => { btn.style.filter = ''; });
            btn.addEventListener('click', () => handleAction(btn.dataset.action));
        });
    }

    function formatLabel(label) {
        const map = { '*': '×', '/': '÷', 'sqrt': '√x', 'x^2': 'x²', 'x^3': 'x³', '1/x': '1/x', 'pi': 'π' };
        return map[label] ?? label;
    }

    function updateDisplay(value) {
        displayValue = value;
        const el = document.getElementById('calc-display');
        if (el) el.textContent = value;
    }

    function handleAction(action) {
        const numericValue = parseFloat(displayValue);

        if (action === 'AC') {
            displayValue = '0';
            storedValue = null;
            pendingOperator = null;
            waitingForOperand = false;
            updateDisplay('0');
            return;
        }

        if (action === '+/-') {
            updateDisplay(String(-numericValue));
            return;
        }

        if (action === '%') {
            updateDisplay(String(numericValue / 100));
            return;
        }

        if (!isNaN(action) || action === '.') {
            if (waitingForOperand) {
                displayValue = action === '.' ? '0.' : action;
                waitingForOperand = false;
            } else {
                if (action === '.' && displayValue.includes('.')) return;
                displayValue = displayValue === '0' && action !== '.' ? action : displayValue + action;
            }
            updateDisplay(displayValue);
            return;
        }

        if (['+', '-', '*', '/'].includes(action)) {
            if (pendingOperator && !waitingForOperand) {
                const result = applyOperator(pendingOperator, storedValue, numericValue);
                updateDisplay(String(result));
                storedValue = result;
            } else {
                storedValue = numericValue;
            }
            pendingOperator = action;
            waitingForOperand = true;
            return;
        }

        if (action === '=') {
            if (pendingOperator !== null && storedValue !== null) {
                const result = applyOperator(pendingOperator, storedValue, numericValue);
                const historyEntry = `${storedValue} ${formatLabel(pendingOperator)} ${numericValue} = ${result}`;
                history.unshift(historyEntry);
                if (history.length > 10) history.pop();
                Store.set('calc-history', history);
                updateDisplay(String(result));
                const histEl = document.getElementById('calc-history-line');
                if (histEl) histEl.textContent = historyEntry;
                pendingOperator = null;
                storedValue = null;
                waitingForOperand = true;
            }
            return;
        }

        // Scientific functions
        let result = null;
        if (action === 'sin') result = Math.sin((numericValue * Math.PI) / 180);
        if (action === 'cos') result = Math.cos((numericValue * Math.PI) / 180);
        if (action === 'tan') result = Math.tan((numericValue * Math.PI) / 180);
        if (action === 'sqrt') result = Math.sqrt(numericValue);
        if (action === 'log') result = Math.log10(numericValue);
        if (action === 'ln') result = Math.log(numericValue);
        if (action === 'pi') result = Math.PI;
        if (action === 'e') result = Math.E;
        if (action === 'x^2') result = Math.pow(numericValue, 2);
        if (action === 'x^3') result = Math.pow(numericValue, 3);
        if (action === '1/x') result = 1 / numericValue;

        if (result !== null) {
            updateDisplay(String(parseFloat(result.toFixed(10))));
            waitingForOperand = true;
        }
    }

    function applyOperator(operator, left, right) {
        if (operator === '+') return left + right;
        if (operator === '-') return left - right;
        if (operator === '*') return left * right;
        if (operator === '/') return right !== 0 ? left / right : 'Error';
        return right;
    }

    buildLayout();
}
