import { AppRegistry } from './registry.js';
import { Router } from './router.js';

const ICON_CONVERTER = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 16 L40 16"/>
  <polyline points="32 8 40 16 32 24"/>
  <path d="M40 32 L8 32"/>
  <polyline points="16 24 8 32 16 40"/>
</svg>`;

const CONVERSION_CATEGORIES = {
    Length: {
        units: ['m','km','cm','mm','in','ft','yd','mi'],
        toBase: { m:1, km:1000, cm:0.01, mm:0.001, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344 },
    },
    Weight: {
        units: ['kg','g','mg','lb','oz','stone','t'],
        toBase: { kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, stone:6.35029, t:1000 },
    },
    Temperature: {
        units: ['°C','°F','K'],
        toBase: null,
    },
    Speed: {
        units: ['m/s','km/h','mph','kn','ft/s'],
        toBase: { 'm/s':1, 'km/h':0.277778, mph:0.44704, kn:0.514444, 'ft/s':0.3048 },
    },
};

function convertTemperature(value, fromUnit, toUnit) {
    let celsius;
    if (fromUnit === '°C') celsius = value;
    else if (fromUnit === '°F') celsius = (value - 32) * 5 / 9;
    else celsius = value - 273.15;
    if (toUnit === '°C') return celsius;
    if (toUnit === '°F') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
}

function convert(value, fromUnit, toUnit, category) {
    if (isNaN(value)) return '';
    if (fromUnit === toUnit) return value;
    if (category === 'Temperature') return convertTemperature(value, fromUnit, toUnit);
    const { toBase } = CONVERSION_CATEGORIES[category];
    return value * toBase[fromUnit] / toBase[toUnit];
}

function formatResult(value) {
    if (value === '' || isNaN(value)) return '';
    const num = Number(value);
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.001 && num !== 0)) return num.toExponential(4);
    return parseFloat(num.toFixed(6)).toString();
}

AppRegistry.register({
    id: 'unitconverter',
    name: 'Converter',
    icon: ICON_CONVERTER,
    removable: true,
    render: renderUnitConverter,
});

function renderUnitConverter(container) {
    let activeCategory = 'Length';

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="uc-back">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="app-chrome-title">Converter</span>
            <span style="width:36px"></span>
        </div>
        <div class="tab-bar" id="uc-tabs">
            ${Object.keys(CONVERSION_CATEGORIES).map((cat, i) =>
                '<button class="tab-bar-btn' + (i === 0 ? ' active' : '') + '" data-cat="' + cat + '">' + cat + '</button>'
            ).join('')}
        </div>
        <div id="uc-body" class="app-body" style="padding:16px;gap:16px"></div>`;

    document.getElementById('uc-back').onclick = () => Router.home();

    container.querySelectorAll('[data-cat]').forEach(btn => {
        btn.onclick = () => {
            container.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            renderConverterBody();
        };
    });

    function renderConverterBody() {
        const body = document.getElementById('uc-body');
        const units = CONVERSION_CATEGORIES[activeCategory].units;

        body.innerHTML = `
            <div class="card" style="gap:12px;display:flex;flex-direction:column">
                <div style="display:flex;align-items:flex-end;gap:10px">
                    <div style="flex:1">
                        <label style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:1px;display:block;margin-bottom:4px">FROM</label>
                        <input id="uc-input" class="pz-input" type="number" placeholder="Enter value" style="font-size:18px;font-weight:600"/>
                    </div>
                    <select id="uc-from" class="pz-input" style="font-size:14px;font-weight:600;min-width:76px;margin-bottom:0">
                        ${units.map(u => '<option>' + u + '</option>').join('')}
                    </select>
                </div>
                <div style="display:flex;align-items:flex-end;gap:10px">
                    <div style="flex:1">
                        <label style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:1px;display:block;margin-bottom:4px">TO</label>
                        <div id="uc-output" style="font-size:18px;font-weight:600;color:var(--accent);padding:10px 12px;background:var(--bg-tertiary);border-radius:10px;min-height:44px">—</div>
                    </div>
                    <select id="uc-to" class="pz-input" style="font-size:14px;font-weight:600;min-width:76px;margin-bottom:0">
                        ${units.map((u, i) => '<option' + (i === 1 ? ' selected' : '') + '>' + u + '</option>').join('')}
                    </select>
                </div>
                <button id="uc-swap" class="pz-btn secondary" style="align-self:center;padding:6px 20px">⇅ Swap</button>
            </div>
            <div class="card">
                <div style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:10px">ALL UNITS</div>
                <div id="uc-all-results" style="display:grid;grid-template-columns:1fr 1fr;gap:6px"></div>
            </div>`;

        const inputEl = document.getElementById('uc-input');
        const fromEl  = document.getElementById('uc-from');
        const toEl    = document.getElementById('uc-to');
        const outputEl = document.getElementById('uc-output');
        const allResultsEl = document.getElementById('uc-all-results');

        function updateConversion() {
            const inputValue = parseFloat(inputEl.value);
            const fromUnit = fromEl.value;
            const toUnit = toEl.value;
            const result = convert(inputValue, fromUnit, toUnit, activeCategory);
            outputEl.textContent = inputEl.value === '' ? '—' : formatResult(result);

            allResultsEl.innerHTML = units.map(unit => {
                const convertedValue = convert(inputValue, fromUnit, unit, activeCategory);
                const isSelected = unit === toUnit;
                return '<div style="padding:6px 8px;border-radius:6px;background:' + (isSelected ? 'var(--bg-secondary)' : 'var(--bg-tertiary)') + ';border:1px solid ' + (isSelected ? 'var(--accent)' : 'transparent') + '">' +
                    '<div style="font-size:10px;color:var(--text-muted);font-weight:600">' + unit + '</div>' +
                    '<div style="font-size:13px;font-weight:700;color:var(--text-primary)">' + (inputEl.value === '' ? '—' : formatResult(convertedValue)) + '</div></div>';
            }).join('');
        }

        inputEl.addEventListener('input', updateConversion);
        fromEl.addEventListener('change', updateConversion);
        toEl.addEventListener('change', updateConversion);

        document.getElementById('uc-swap').onclick = () => {
            const temp = fromEl.value;
            fromEl.value = toEl.value;
            toEl.value = temp;
            updateConversion();
        };

        updateConversion();
    }

    renderConverterBody();
}
