// PlaystoreImportApps/MorseCode.js
// APIs injected: AppRegistry, Store, Router, Notify, Dialog, EventBus, Badge, Sound, Http

const MC_BACK = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5"
  stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <polyline points="30,12 18,24 30,36"/>
</svg>`;

const MC_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <circle cx="5" cy="12" r="3"/>
  <rect x="10" y="9.5" width="9" height="5" rx="2.5"/>
</svg>`;

const MORSE_TABLE = {
  A:'.-',   B:'-...', C:'-.-.', D:'-..', E:'.',    F:'..-.', G:'--.',  H:'....',
  I:'..',   J:'.---', K:'-.-',  L:'.-..', M:'--',  N:'-.',   O:'---',  P:'.--.',
  Q:'--.-', R:'.-.',  S:'...',  T:'-',    U:'..-', V:'...-', W:'.--',  X:'-..-',
  Y:'-.--', Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--',
  '/':'-..-.','(':'-.--.',')'  :'-.--.-','+':'.-.-.', '-':'-....-',
};

const MC_DECODE = Object.fromEntries(Object.entries(MORSE_TABLE).map(([c,m]) => [m,c]));
const mcSym     = s => s.replace(/\./g,'·').replace(/-/g,'—');

const MC_THEMES = {
  amber:   { label:'Amber',    bg:'#0c0d11', ac:'#f5a623', vars:{ '--mc-bg':'#0c0d11','--mc-s':'#14161f','--mc-s2':'#1b1d28','--mc-br':'#252838','--mc-ac':'#f5a623','--mc-tx':'#dde0f0','--mc-dm':'#484b66','--mc-rd':'#e05c5c' }},
  terminal:{ label:'Terminal', bg:'#030a04', ac:'#00e84a', vars:{ '--mc-bg':'#030a04','--mc-s':'#071009','--mc-s2':'#0c1a0e','--mc-br':'#143018','--mc-ac':'#00e84a','--mc-tx':'#aaeeb4','--mc-dm':'#286030','--mc-rd':'#ff4455' }},
  ocean:   { label:'Ocean',    bg:'#050c18', ac:'#00ccff', vars:{ '--mc-bg':'#050c18','--mc-s':'#091528','--mc-s2':'#0d1f3c','--mc-br':'#162e58','--mc-ac':'#00ccff','--mc-tx':'#b8dcff','--mc-dm':'#254878','--mc-rd':'#ff4466' }},
  crimson: { label:'Crimson',  bg:'#110508', ac:'#ff2244', vars:{ '--mc-bg':'#110508','--mc-s':'#1e0b10','--mc-s2':'#2c1018','--mc-br':'#44181f','--mc-ac':'#ff2244','--mc-tx':'#f0c8cc','--mc-dm':'#662830','--mc-rd':'#ff2244' }},
  violet:  { label:'Violet',   bg:'#0a0610', ac:'#cc66ff', vars:{ '--mc-bg':'#0a0610','--mc-s':'#130e20','--mc-s2':'#1c1630','--mc-br':'#2e2248','--mc-ac':'#cc66ff','--mc-tx':'#e8d8ff','--mc-dm':'#5a4478','--mc-rd':'#ff5566' }},
  paper:   { label:'Paper',    bg:'#f4f0e4', ac:'#8b4513', vars:{ '--mc-bg':'#f4f0e4','--mc-s':'#faf8f2','--mc-s2':'#ece8dc','--mc-br':'#ccc8bc','--mc-ac':'#8b4513','--mc-tx':'#28200f','--mc-dm':'#998870','--mc-rd':'#cc2222' }},
};

const MC_DEF = {
  soundOn:true, volume:80,
  letterDelayMs:1000, autoWordSpace:true,
};

const mcStore = Store.namespace('morse-code');

AppRegistry.register({ id:'morsecode', name:'Morse', icon:MC_ICON, removable:true, render:renderMorseApp });

function mcInjectStyles() {
  if (document.querySelector('style[data-app="morsecode"]')) return;
  const st = document.createElement('style');
  st.setAttribute('data-app','morsecode');
  st.textContent = `
.mc-root{display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--mc-bg);color:var(--mc-tx);position:relative;font-family:monospace;
  --mc-bg:#0c0d11;--mc-s:#14161f;--mc-s2:#1b1d28;--mc-br:#252838;
  --mc-ac:#f5a623;--mc-tx:#dde0f0;--mc-dm:#484b66;--mc-rd:#e05c5c;}
.mc-scroll{flex:1;overflow-y:auto;overflow-x:hidden;}
.mc-topbar{display:flex;align-items:center;justify-content:space-between;padding:.4rem .75rem;
  border-bottom:1px solid var(--mc-br);background:var(--mc-bg);position:sticky;top:0;z-index:5;}
.mc-logo{font-size:.7rem;letter-spacing:4px;color:var(--mc-dm);}
.mc-nsec{padding:.6rem .75rem 0;}
.mc-nmeta{display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem;}
.mc-stat{font-size:.65rem;color:var(--mc-dm);letter-spacing:1px;}
.mc-copy{font-size:.68rem;background:none;border:1px solid var(--mc-br);border-radius:4px;
  color:var(--mc-dm);padding:.18rem .55rem;cursor:pointer;white-space:nowrap;flex-shrink:0;
  font-family:monospace;transition:color .15s,border-color .15s;}
.mc-copy:active{color:var(--mc-ac);border-color:var(--mc-ac);}
.mc-copy.copied{color:#4ec98a;border-color:#4ec98a;}
.mc-notes{background:var(--mc-s);border:1px solid var(--mc-br);border-radius:10px;
  padding:.6rem .75rem;min-height:80px;line-height:1.7;color:var(--mc-tx);
  word-break:break-all;white-space:pre-wrap;width:100%;overflow:hidden;}
.mc-notes.sz-sm{font-size:.9rem;}.mc-notes.sz-md{font-size:1.1rem;}.mc-notes.sz-lg{font-size:1.4rem;}
.mc-hint{color:var(--mc-dm);font-size:.85rem;}
.mc-cursor{display:inline-block;width:2px;height:1.1em;background:var(--mc-ac);
  vertical-align:text-bottom;margin-left:1px;animation:mc-blink 1s step-end infinite;}
@keyframes mc-blink{50%{opacity:0;}}
.mc-kb{background:var(--mc-bg);border-top:1px solid var(--mc-br);flex-shrink:0;}
.mc-pbar{display:flex;align-items:center;justify-content:center;gap:8px;
  padding:8px 12px;border-bottom:1px solid var(--mc-br);min-height:38px;}
.mc-ps{font-size:16px;color:var(--mc-ac);letter-spacing:3px;min-width:28px;text-align:right;}
.mc-pa{font-size:13px;color:var(--mc-dm);}
.mc-pc{font-size:17px;color:var(--mc-tx);min-width:14px;}
.mc-main{display:flex;gap:1px;background:var(--mc-br);}
.mc-kbtn{flex:1;background:var(--mc-s);border:none;cursor:pointer;touch-action:manipulation;
  user-select:none;-webkit-user-select:none;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:4px;padding:20px 0;min-height:84px;transition:background .07s;}
.mc-dot:active{background:color-mix(in srgb,var(--mc-ac) 14%,var(--mc-s));}
.mc-dash:active{background:color-mix(in srgb,var(--mc-ac) 22%,var(--mc-s));}
.mc-sym{font-size:36px;color:var(--mc-ac);line-height:1;}
.mc-klbl{font-size:10px;color:var(--mc-dm);letter-spacing:1px;}
.mc-util{display:flex;gap:1px;background:var(--mc-br);}
.mc-ubtn{flex:1;background:var(--mc-s2);border:none;color:var(--mc-dm);font-family:monospace;
  font-size:14px;padding:18px 0;min-height:56px;cursor:pointer;touch-action:manipulation;
  user-select:none;-webkit-user-select:none;white-space:nowrap;overflow:hidden;transition:background .08s,color .08s;}
.mc-ubtn:active{background:var(--mc-br);color:var(--mc-tx);}
.mc-sp{flex:2;}.mc-cl:active{color:var(--mc-rd);}
.mc-cl.holding{color:var(--mc-rd);animation:mc-chg .6s linear forwards;}
@keyframes mc-chg{0%{background:var(--mc-s2);}100%{background:color-mix(in srgb,var(--mc-rd) 28%,var(--mc-s2));}}
.mc-tbtn{font-family:monospace;font-size:.72rem;background:var(--mc-s2);border:1px solid var(--mc-br);
  border-radius:6px;color:var(--mc-tx);padding:.25rem .7rem;cursor:pointer;touch-action:manipulation;
  white-space:nowrap;transition:background .1s;}
.mc-tbtn:active{background:var(--mc-br);}
.mc-ref{max-height:0;overflow:hidden;transition:max-height .3s ease;}
.mc-ref.open{max-height:42dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;border-bottom:1px solid var(--mc-br);}
.mc-ref-sec{border-bottom:1px solid var(--mc-br);}
.mc-ref-sec:last-child{border-bottom:none;}
.mc-ref-lbl{font-size:.52rem;letter-spacing:2px;text-transform:uppercase;color:var(--mc-dm);
  padding:.22rem .5rem;background:var(--mc-s2);border-bottom:1px solid var(--mc-br);}
.mc-ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:1px;background:var(--mc-br);}
.mc-ref-card{background:var(--mc-s);padding:.28rem .05rem;display:flex;flex-direction:column;
  align-items:center;gap:.08rem;cursor:pointer;touch-action:manipulation;user-select:none;
  transition:background .15s;overflow:hidden;min-width:0;}
.mc-ref-card:active,.mc-ref-card.flash{background:color-mix(in srgb,var(--mc-ac) 20%,var(--mc-s));}
.mc-ref-ch{font-size:.78rem;font-weight:700;color:var(--mc-tx);}
.mc-ref-ms{font-size:.5rem;color:var(--mc-ac);letter-spacing:.5px;max-width:100%;overflow:hidden;}
.mc-ov{position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:150;opacity:0;pointer-events:none;transition:opacity .25s;}
.mc-ov.open{opacity:1;pointer-events:all;}
.mc-sh{position:absolute;bottom:0;left:0;right:0;z-index:200;background:var(--mc-s);border-top:1px solid var(--mc-br);
  border-radius:16px 16px 0 0;transform:translateY(100%);transition:transform .32s cubic-bezier(.32,.72,0,1);
  max-height:82%;display:flex;flex-direction:column;}
.mc-sh.open{transform:translateY(0);}
.mc-hdl{width:32px;height:3px;background:var(--mc-br);border-radius:2px;margin:8px auto 0;flex-shrink:0;}
.mc-shdr{display:flex;align-items:center;justify-content:space-between;padding:.5rem 1rem .4rem;border-bottom:1px solid var(--mc-br);flex-shrink:0;}
.mc-shtl{font-size:.62rem;letter-spacing:3px;color:var(--mc-dm);}
.mc-shx{background:none;border:none;color:var(--mc-dm);font-size:.95rem;cursor:pointer;padding:.2rem .4rem;transition:color .1s;}
.mc-shx:active{color:var(--mc-tx);}
.mc-shb{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:.35rem 0 1rem;}
.mc-grp{padding:.6rem 1rem;border-bottom:1px solid var(--mc-br);}
.mc-glbl{font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--mc-dm);margin-bottom:.5rem;}
.mc-row{display:flex;align-items:center;justify-content:space-between;font-size:.8rem;color:var(--mc-tx);min-height:30px;gap:.5rem;}
.mc-row+.mc-row{margin-top:.3rem;}
.mc-tog{font-family:monospace;font-size:.65rem;padding:.22rem .7rem;border-radius:20px;border:1px solid var(--mc-br);
  min-width:46px;text-align:center;cursor:pointer;flex-shrink:0;transition:background .15s,color .15s,border-color .15s;}
.mc-tog[data-on="true"]{background:var(--mc-ac);color:var(--mc-bg);border-color:var(--mc-ac);}
.mc-tog[data-on="false"]{background:var(--mc-s2);color:var(--mc-dm);}
.mc-rng{display:flex;align-items:center;gap:.5rem;flex-shrink:0;}
.mc-rng input[type=range]{width:90px;accent-color:var(--mc-ac);}
.mc-rng span{font-size:.7rem;color:var(--mc-dm);min-width:42px;text-align:right;white-space:nowrap;}
.mc-tgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:.4rem;}
.mc-tcard{border-radius:8px;border:2px solid var(--mc-br);overflow:hidden;cursor:pointer;touch-action:manipulation;transition:border-color .15s;}
.mc-tcard.on{border-color:var(--mc-ac);}
.mc-tprev{height:28px;display:flex;align-items:center;justify-content:center;gap:4px;}
.mc-tdot{width:7px;height:7px;border-radius:50%;}
.mc-tdash{width:18px;height:7px;border-radius:3px;}
.mc-tname{font-size:.58rem;text-align:center;padding:.2rem 0;background:var(--mc-s);color:var(--mc-tx);}
.mc-rstbtn{display:block;width:calc(100% - 2rem);margin:.6rem 1rem 0;font-family:monospace;font-size:.72rem;
  padding:.45rem;border-radius:7px;border:1px solid var(--mc-br);background:var(--mc-s2);color:var(--mc-dm);
  cursor:pointer;transition:color .15s,border-color .15s;}
.mc-rstbtn:active{color:var(--mc-rd);border-color:var(--mc-rd);}`;
  document.head.appendChild(st);
}

function renderMorseApp(container) {
  mcInjectStyles();

  const entries   = [];
  let pendingSyms = [];
  let letterTimer = null;
  let wordTimer   = null;
  let cursorPos   = 0;
  const undoStack = [];
  let cfg = { ...MC_DEF, ...(mcStore.get('cfg') || {}) };

  const audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);

  container.innerHTML = `
    <div class="mc-root" id="mc-root">
      <div class="mc-scroll">

        <div class="mc-topbar">
          <button class="app-chrome-btn" id="mc-back">${MC_BACK}</button>
          <span class="mc-logo">MORSE</span>
          <div style="display:flex;gap:.4rem">
            <button class="mc-tbtn" id="mc-ref-btn">A–Z</button>
            <button class="mc-tbtn" id="mc-cfg-btn">⚙</button>
          </div>
        </div>

        <div class="mc-ref" id="mc-ref"></div>

        <div class="mc-nsec">
          <div class="mc-nmeta">
            <span class="mc-stat" id="mc-cnt">0 chars</span>
            <button class="mc-copy" id="mc-copy">copy</button>
          </div>
          <div class="mc-notes sz-md" id="mc-notes">
            <span class="mc-hint">tap the keys below…</span>
          </div>
        </div>

      </div>

      <div class="mc-kb">
        <div class="mc-pbar">
          <span class="mc-ps" id="mc-ps"></span>
          <span class="mc-pa" id="mc-pa"></span>
          <span class="mc-pc" id="mc-pc"></span>
        </div>
        <div class="mc-main">
          <button class="mc-kbtn mc-dot"  id="mc-dot">
            <span class="mc-sym">·</span>
            <span class="mc-klbl">short</span>
          </button>
          <button class="mc-kbtn mc-dash" id="mc-dash">
            <span class="mc-sym">—</span>
            <span class="mc-klbl">long</span>
          </button>
        </div>
        <div class="mc-util">
          <button class="mc-ubtn" id="mc-lft">‹</button>
          <button class="mc-ubtn" id="mc-bk">⌫</button>
          <button class="mc-ubtn mc-sp"  id="mc-spc">space</button>
          <button class="mc-ubtn mc-cl"  id="mc-clr">clear</button>
          <button class="mc-ubtn" id="mc-rgt">›</button>
        </div>
      </div>

      <div class="mc-ov" id="mc-ov"></div>
      <div class="mc-sh" id="mc-sh">
        <div class="mc-hdl"></div>
        <div class="mc-shdr">
          <span class="mc-shtl">SETTINGS</span>
          <button class="mc-shx" id="mc-shx">✕</button>
        </div>
        <div class="mc-shb" id="mc-shb"></div>
      </div>
    </div>`;

  const root    = container.querySelector('#mc-root');
  const elNotes = container.querySelector('#mc-notes');
  const elPS    = container.querySelector('#mc-ps');
  const elPA    = container.querySelector('#mc-pa');
  const elPC    = container.querySelector('#mc-pc');
  const elCnt   = container.querySelector('#mc-cnt');

  // ── Audio ─────────────────────────────────────────────────────────────────
  function scheduleTone(startTime, duration) {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.frequency.value = 680;
    osc.type            = 'sine';
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.85, startTime + 0.005);
    gain.gain.setValueAtTime(0.85, startTime + duration - 0.005);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime); osc.stop(startTime + duration);
  }

  function playKeyTone(isDash) {
    if (!cfg.soundOn) return;
    audioCtx.resume();
    masterGain.gain.value = cfg.volume / 100;
    scheduleTone(audioCtx.currentTime + 0.01, isDash ? 0.24 : 0.08);
  }

  // ── Undo ──────────────────────────────────────────────────────────────────
  function pushUndo() {
    undoStack.push({ entries: entries.map(e => ({ ...e })), cursorPos });
    if (undoStack.length > 50) undoStack.shift();
  }

  function undo() {
    if (!undoStack.length) return;
    clearTimeout(letterTimer); clearTimeout(wordTimer);
    const snap = undoStack.pop();
    entries.length = 0; entries.push(...snap.entries);
    cursorPos   = snap.cursorPos;
    pendingSyms = [];
    refreshPending(); refreshNotes();
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  function addSymbol(isDash) {
    audioCtx.resume();
    clearTimeout(letterTimer); clearTimeout(wordTimer);
    pendingSyms.push(isDash ? '-' : '.');
    playKeyTone(isDash);
    refreshPending();
    letterTimer = setTimeout(commitLetter, cfg.letterDelayMs);
  }

  function commitLetter() {
    if (!pendingSyms.length) return;
    pushUndo();
    const morse = pendingSyms.join('');
    const char  = MC_DECODE[morse] ?? '?';
    entries.splice(cursorPos, 0, { char, morse });
    cursorPos++;
    pendingSyms = [];
    refreshPending(); refreshNotes(); flashRefCard(char);
    if (cfg.autoWordSpace) {
      wordTimer = setTimeout(() => {
        entries.splice(cursorPos, 0, { space: true });
        cursorPos++;
        refreshNotes();
      }, cfg.letterDelayMs * 2.5);
    }
  }

  function addSpace() {
    clearTimeout(letterTimer); clearTimeout(wordTimer);
    pushUndo();
    if (pendingSyms.length) {
      const morse = pendingSyms.join('');
      entries.splice(cursorPos, 0, { char: MC_DECODE[morse] ?? '?', morse });
      cursorPos++;
      pendingSyms = [];
    }
    entries.splice(cursorPos, 0, { space: true });
    cursorPos++;
    refreshPending(); refreshNotes();
  }

  function backspace() {
    clearTimeout(letterTimer); clearTimeout(wordTimer);
    if (pendingSyms.length) {
      pendingSyms.pop();
      refreshPending();
      if (pendingSyms.length) letterTimer = setTimeout(commitLetter, cfg.letterDelayMs);
    } else if (cursorPos > 0) {
      pushUndo();
      entries.splice(cursorPos - 1, 1);
      cursorPos--;
      refreshNotes();
    }
  }

  function clearAll() {
    if (!entries.length && !pendingSyms.length) return;
    pushUndo();
    clearTimeout(letterTimer); clearTimeout(wordTimer);
    entries.length = 0; cursorPos = 0; pendingSyms = [];
    refreshPending(); refreshNotes();
  }

  function moveCursorLeft()  { if (cursorPos > 0)              { cursorPos--; refreshNotes(); } }
  function moveCursorRight() { if (cursorPos < entries.length)  { cursorPos++; refreshNotes(); } }

  // ── Display ───────────────────────────────────────────────────────────────
  function refreshPending() {
    const morse = pendingSyms.join('');
    if (!morse) {
      elPS.textContent = elPA.textContent = elPC.textContent = '';
      return;
    }
    elPS.textContent = mcSym(morse);
    elPA.textContent = '→';
    elPC.textContent = MC_DECODE[morse] ?? '?';
  }

  function refreshNotes() {
    const rawText  = entries.map(e => e.space ? ' ' : e.char).join('');
    const charCount = rawText.replace(/ /g,'').length;
    const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
    elCnt.textContent = charCount + ' chars · ' + wordCount + ' word' + (wordCount !== 1 ? 's' : '');

    if (!rawText) {
      elNotes.innerHTML = '<span class="mc-hint">tap the keys below…</span>';
      saveSession(); return;
    }
    const esc    = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const before = esc(rawText.substring(0, cursorPos));
    const after  = esc(rawText.substring(cursorPos));
    elNotes.innerHTML = before + '<span class="mc-cursor"></span>' + after;
    saveSession();
  }

  // ── Persistence ───────────────────────────────────────────────────────────
  function saveSession() {
    mcStore.set('session', { entries, cursorPos });
  }

  function loadSession() {
    const saved = mcStore.get('session');
    if (!saved || !Array.isArray(saved.entries) || !saved.entries.length) return;
    entries.push(...saved.entries);
    cursorPos = typeof saved.cursorPos === 'number'
      ? Math.min(saved.cursorPos, saved.entries.length)
      : saved.entries.length;
  }

  // ── Copy ──────────────────────────────────────────────────────────────────
  function initCopy() {
    const copyBtn = container.querySelector('#mc-copy');
    copyBtn.addEventListener('click', async () => {
      const text = entries.map(e => e.space ? ' ' : e.char).join('').toUpperCase();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = 'copy'; copyBtn.classList.remove('copied'); }, 1800);
      } catch (_) {
        copyBtn.textContent = 'failed';
        setTimeout(() => { copyBtn.textContent = 'copy'; }, 1500);
      }
    });
  }

  // ── Keyboard init ─────────────────────────────────────────────────────────
  function initKeyboard() {
    container.querySelector('#mc-dot').addEventListener('pointerdown',  e => { e.preventDefault(); addSymbol(false); });
    container.querySelector('#mc-dash').addEventListener('pointerdown', e => { e.preventDefault(); addSymbol(true); });
    container.querySelector('#mc-spc').addEventListener('pointerdown',  e => { e.preventDefault(); addSpace(); });
    container.querySelector('#mc-lft').addEventListener('pointerdown',  e => { e.preventDefault(); moveCursorLeft(); });
    container.querySelector('#mc-rgt').addEventListener('pointerdown',  e => { e.preventDefault(); moveCursorRight(); });

    // Hold-to-repeat backspace
    const bkBtn = container.querySelector('#mc-bk');
    let bkHold, bkRepeat;
    bkBtn.addEventListener('pointerdown', e => {
      e.preventDefault(); backspace();
      bkHold = setTimeout(() => { bkRepeat = setInterval(backspace, 80); }, 450);
    });
    bkBtn.addEventListener('pointerup',    () => { clearTimeout(bkHold); clearInterval(bkRepeat); });
    bkBtn.addEventListener('pointerleave', () => { clearTimeout(bkHold); clearInterval(bkRepeat); });

    // Hold-to-clear
    const clrBtn = container.querySelector('#mc-clr');
    let clrHold;
    clrBtn.addEventListener('pointerdown', e => {
      e.preventDefault();
      clrBtn.classList.add('holding');
      clrHold = setTimeout(() => { clrBtn.classList.remove('holding'); clearAll(); }, 600);
    });
    clrBtn.addEventListener('pointerup',    () => { clearTimeout(clrHold); clrBtn.classList.remove('holding'); });
    clrBtn.addEventListener('pointerleave', () => { clearTimeout(clrHold); clrBtn.classList.remove('holding'); });

    // Back button
    container.querySelector('#mc-back').addEventListener('click', () => {
      clearTimeout(letterTimer); clearTimeout(wordTimer);
      Router.home();
    });
  }

  // ── Reference panel ───────────────────────────────────────────────────────
  function buildReference() {
    const panel = container.querySelector('#mc-ref');
    const SECTIONS = [
      { label:'Letters',     chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
      { label:'Numbers',     chars:'0123456789'.split('') },
      { label:'Punctuation', chars:['.', ',', '?', '!', '/', '(', ')', '+', '-'] },
    ];

    SECTIONS.forEach(({ label, chars }) => {
      const sec = document.createElement('div');
      sec.className = 'mc-ref-sec';

      const heading = document.createElement('div');
      heading.className   = 'mc-ref-lbl';
      heading.textContent = label;
      sec.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'mc-ref-grid';

      chars.forEach(char => {
        const morse = MORSE_TABLE[char];
        if (!morse) return;
        const card = document.createElement('div');
        card.className = 'mc-ref-card';
        card.dataset.char = char;
        card.innerHTML =
          '<span class="mc-ref-ch">' + char + '</span>' +
          '<span class="mc-ref-ms">' + mcSym(morse) + '</span>';
        card.addEventListener('pointerdown', e => {
          e.preventDefault();
          flashRefCard(char);
          playRefTone(morse);
        });
        grid.appendChild(card);
      });

      sec.appendChild(grid);
      panel.appendChild(sec);
    });
  }

  function flashRefCard(char) {
    const card = container.querySelector('.mc-ref-card[data-char="' + char + '"]');
    if (!card) return;
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 500);
  }

  function playRefTone(morse) {
    if (!cfg.soundOn) return;
    audioCtx.resume();
    masterGain.gain.value = cfg.volume / 100;
    let scheduledTime = audioCtx.currentTime + 0.05;
    morse.split('').forEach((sym, index, all) => {
      const duration = sym === '-' ? 0.24 : 0.08;
      scheduleTone(scheduledTime, duration);
      scheduledTime += duration + (index < all.length - 1 ? 0.08 : 0);
    });
  }

  function initRefToggle() {
    container.querySelector('#mc-ref-btn').addEventListener('click', () => {
      container.querySelector('#mc-ref').classList.toggle('open');
    });
  }

  // ── Theme ─────────────────────────────────────────────────────────────────
  function applyTheme(name) {
    const theme = MC_THEMES[name] || MC_THEMES.amber;
    Object.entries(theme.vars).forEach(([k,v]) => root.style.setProperty(k,v));
    cfg.theme = name;
    container.querySelectorAll('.mc-tcard').forEach(card =>
      card.classList.toggle('on', card.dataset.theme === name)
    );
  }

  // ── Settings sheet ────────────────────────────────────────────────────────
  function buildSettings() {
    const body = container.querySelector('#mc-shb');
    body.innerHTML = '';

    // ── Theme ──
    const themeGrp = document.createElement('div');
    themeGrp.className = 'mc-grp';
    themeGrp.innerHTML = '<div class="mc-glbl">Theme</div>';
    const themeGrid = document.createElement('div');
    themeGrid.className = 'mc-tgrid';
    Object.entries(MC_THEMES).forEach(([key, theme]) => {
      const card = document.createElement('div');
      card.className = 'mc-tcard' + (key === cfg.theme ? ' on' : '');
      card.dataset.theme = key;
      card.innerHTML =
        '<div class="mc-tprev" style="background:' + theme.bg + '">' +
          '<div class="mc-tdot" style="background:' + theme.ac + '"></div>' +
          '<div class="mc-tdash" style="background:' + theme.ac + '"></div>' +
        '</div>' +
        '<div class="mc-tname">' + theme.label + '</div>';
      card.addEventListener('pointerdown', e => {
        e.preventDefault();
        applyTheme(key);
        mcStore.set('cfg', cfg);
      });
      themeGrid.appendChild(card);
    });
    themeGrp.appendChild(themeGrid);
    body.appendChild(themeGrp);

    // ── Sound ──
    const soundGrp = document.createElement('div');
    soundGrp.className = 'mc-grp';
    soundGrp.innerHTML =
      '<div class="mc-glbl">Sound</div>' +
      '<div class="mc-row"><span>Enabled</span>' +
        '<button class="mc-tog" id="mc-tog-snd" data-on="' + cfg.soundOn + '">' + (cfg.soundOn ? 'ON' : 'OFF') + '</button>' +
      '</div>' +
      '<div class="mc-row" id="mc-vol-row"><span>Volume</span>' +
        '<div class="mc-rng"><input id="mc-vol" type="range" min="0" max="100" value="' + cfg.volume + '"/>' +
        '<span id="mc-vol-lbl">' + cfg.volume + '%</span></div>' +
      '</div>';
    body.appendChild(soundGrp);

    soundGrp.querySelector('#mc-tog-snd').addEventListener('click', function() {
      cfg.soundOn = !cfg.soundOn;
      this.dataset.on  = cfg.soundOn;
      this.textContent = cfg.soundOn ? 'ON' : 'OFF';
      soundGrp.querySelector('#mc-vol-row').style.opacity = cfg.soundOn ? '1' : '.4';
      mcStore.set('cfg', cfg);
    });
    soundGrp.querySelector('#mc-vol').addEventListener('input', function() {
      cfg.volume = Number(this.value);
      soundGrp.querySelector('#mc-vol-lbl').textContent = cfg.volume + '%';
      mcStore.set('cfg', cfg);
    });
    soundGrp.querySelector('#mc-vol-row').style.opacity = cfg.soundOn ? '1' : '.4';

    // ── Timing ──
    const timGrp = document.createElement('div');
    timGrp.className = 'mc-grp';
    timGrp.innerHTML =
      '<div class="mc-glbl">Timing</div>' +
      '<div class="mc-row"><span>Letter gap</span>' +
        '<div class="mc-rng"><input id="mc-delay" type="range" min="3" max="30" value="' + (cfg.letterDelayMs / 100) + '"/>' +
        '<span id="mc-delay-lbl">' + (cfg.letterDelayMs / 1000).toFixed(1) + 's</span></div>' +
      '</div>' +
      '<div class="mc-row"><span>Auto word space</span>' +
        '<button class="mc-tog" id="mc-tog-aws" data-on="' + cfg.autoWordSpace + '">' + (cfg.autoWordSpace ? 'ON' : 'OFF') + '</button>' +
      '</div>';
    body.appendChild(timGrp);
    timGrp.querySelector('#mc-delay').addEventListener('input', function() {
      cfg.letterDelayMs = Number(this.value) * 100;
      timGrp.querySelector('#mc-delay-lbl').textContent = (cfg.letterDelayMs / 1000).toFixed(1) + 's';
      mcStore.set('cfg', cfg);
    });
    timGrp.querySelector('#mc-tog-aws').addEventListener('click', function() {
      cfg.autoWordSpace = !cfg.autoWordSpace;
      this.dataset.on  = cfg.autoWordSpace;
      this.textContent = cfg.autoWordSpace ? 'ON' : 'OFF';
      mcStore.set('cfg', cfg);
    });

    // ── Reset ──
    const rstBtn = document.createElement('button');
    rstBtn.className   = 'mc-rstbtn';
    rstBtn.textContent = 'Reset to defaults';
    rstBtn.addEventListener('click', () => {
      cfg = { ...MC_DEF };
      mcStore.set('cfg', cfg);
      applyTheme(cfg.theme);
      buildSettings();
      closeSettings();
    });
    body.appendChild(rstBtn);
  }

  function openSettings()  {
    container.querySelector('#mc-ov').classList.add('open');
    container.querySelector('#mc-sh').classList.add('open');
  }

  function closeSettings() {
    container.querySelector('#mc-ov').classList.remove('open');
    container.querySelector('#mc-sh').classList.remove('open');
  }

  function initSettings() {
    container.querySelector('#mc-cfg-btn').addEventListener('click', openSettings);
    container.querySelector('#mc-shx').addEventListener('click', closeSettings);
    container.querySelector('#mc-ov').addEventListener('click', closeSettings);
  }

  // ── Swipe gestures on keyboard ────────────────────────────────────────────
  function initSwipe() {
    const kb = container.querySelector('.mc-kb');
    let swipeStartX = 0;
    let swipeStartY = 0;

    kb.addEventListener('touchstart', e => {
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
    }, { passive: true });

    kb.addEventListener('touchend', e => {
      const deltaX = e.changedTouches[0].clientX - swipeStartX;
      const deltaY = e.changedTouches[0].clientY - swipeStartY;
      if (Math.abs(deltaY) > 35) return;
      if (deltaX < -55) backspace();
      if (deltaX >  55) undo();
    }, { passive: true });
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  loadSession();
  applyTheme(cfg.theme);
  buildReference();
  buildSettings();
  initKeyboard();
  initSwipe();
  initRefToggle();
  initSettings();
  initCopy();
  refreshPending();
  refreshNotes();
}
