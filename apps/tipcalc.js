import { AppRegistry } from './registry.js';
import { Router } from './router.js';

const ICON_TIPCALC = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="10" y="6" width="28" height="36" rx="5"/>
  <line x1="16" y1="16" x2="32" y2="16"/>
  <line x1="16" y1="22" x2="32" y2="22"/>
  <line x1="16" y1="28" x2="24" y2="28"/>
  <circle cx="31" cy="35" r="8" fill="var(--bg-primary)" stroke="currentColor"/>
  <line x1="31" y1="31" x2="31" y2="39"/>
  <line x1="27" y1="35" x2="35" y2="35"/>
</svg>`;

const PRESET_TIP_PERCENTAGES = [10, 15, 18, 20, 25, 30];

AppRegistry.register({
    id: 'tipcalc',
    name: 'Tip Calc',
    icon: ICON_TIPCALC,
    removable: true,
    render: renderTipCalc,
});

function renderTipCalc(container) {
    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="tc-back">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="app-chrome-title">Tip Calculator</span>
            <span style="width:36px"></span>
        </div>
        <div class="app-body" style="padding:16px;gap:14px">
            <div class="card" style="gap:14px;display:flex;flex-direction:column">
                <div>
                    <label style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted);display:block;margin-bottom:6px">BILL TOTAL</label>
                    <div style="position:relative">
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:18px;font-weight:700;color:var(--text-muted)">$</span>
                        <input id="tc-bill" class="pz-input" type="number" min="0" step="0.01" placeholder="0.00"
                            style="padding-left:28px;font-size:22px;font-weight:700"/>
                    </div>
                </div>
                <div>
                    <label style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted);display:block;margin-bottom:6px">TIP %</label>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                        ${PRESET_TIP_PERCENTAGES.map(pct =>
                            '<button class="tc-tip-preset pz-btn secondary" data-pct="' + pct + '" style="flex:1;min-width:44px;padding:8px 4px;font-size:14px;font-weight:700">' + pct + '%</button>'
                        ).join('')}
                    </div>
                    <input id="tc-tip" class="pz-input" type="number" min="0" max="100" step="1" placeholder="Custom %"
                        style="font-size:16px;font-weight:600"/>
                </div>
                <div>
                    <label style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted);display:block;margin-bottom:6px">SPLIT BETWEEN</label>
                    <div style="display:flex;align-items:center;gap:10px">
                        <button id="tc-minus" class="pz-btn secondary" style="width:40px;height:40px;padding:0;font-size:22px;font-weight:700">−</button>
                        <div id="tc-people" style="flex:1;text-align:center;font-size:24px;font-weight:800;color:var(--text-primary)">1</div>
                        <button id="tc-plus"  class="pz-btn secondary" style="width:40px;height:40px;padding:0;font-size:22px;font-weight:700">+</button>
                    </div>
                </div>
            </div>
            <div class="card" style="padding:0;overflow:hidden">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr">
                    <div style="background:#6366f1;padding:14px;text-align:center">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,0.7);margin-bottom:4px">TIP</div>
                        <div id="tc-tip-amount" style="font-size:20px;font-weight:800;color:white">$0.00</div>
                    </div>
                    <div style="background:#4f46e5;padding:14px;text-align:center">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,0.7);margin-bottom:4px">TOTAL</div>
                        <div id="tc-total" style="font-size:20px;font-weight:800;color:white">$0.00</div>
                    </div>
                    <div style="background:#4338ca;padding:14px;text-align:center">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,0.7);margin-bottom:4px">/ PERSON</div>
                        <div id="tc-per-person" style="font-size:20px;font-weight:800;color:white">$0.00</div>
                    </div>
                </div>
            </div>
        </div>`;

    document.getElementById('tc-back').onclick = () => Router.home();

    let people = 1;
    const billInput   = document.getElementById('tc-bill');
    const tipInput    = document.getElementById('tc-tip');
    const peopleDisplay = document.getElementById('tc-people');
    const tipAmountEl = document.getElementById('tc-tip-amount');
    const totalEl     = document.getElementById('tc-total');
    const perPersonEl = document.getElementById('tc-per-person');

    function recalculate() {
        const bill   = parseFloat(billInput.value) || 0;
        const tipPct = parseFloat(tipInput.value) || 0;
        const tip    = bill * (tipPct / 100);
        const total  = bill + tip;
        tipAmountEl.textContent = '$' + tip.toFixed(2);
        totalEl.textContent     = '$' + total.toFixed(2);
        perPersonEl.textContent = '$' + (total / people).toFixed(2);
    }

    function setActivePreset(selectedPct) {
        container.querySelectorAll('.tc-tip-preset').forEach(btn => {
            const isActive = parseInt(btn.dataset.pct) === selectedPct;
            btn.style.background = isActive ? '#6366f1' : '';
            btn.style.color      = isActive ? 'white' : '';
            btn.style.borderColor = isActive ? '#6366f1' : '';
        });
    }

    container.querySelectorAll('.tc-tip-preset').forEach(btn => {
        btn.onclick = () => {
            tipInput.value = btn.dataset.pct;
            setActivePreset(parseInt(btn.dataset.pct));
            recalculate();
        };
    });

    tipInput.addEventListener('input', () => { setActivePreset(-1); recalculate(); });
    billInput.addEventListener('input', recalculate);

    document.getElementById('tc-minus').onclick = () => { if (people > 1)  { people--; peopleDisplay.textContent = people; recalculate(); } };
    document.getElementById('tc-plus').onclick  = () => { if (people < 50) { people++; peopleDisplay.textContent = people; recalculate(); } };

    // Default to 15%
    tipInput.value = 15;
    setActivePreset(15);
}
