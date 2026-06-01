// PlaystoreImportApps/FreeMovies.js
// APIs injected: AppRegistry, Store, Router, Notify, Dialog, EventBus, Badge, Sound, Http

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const FM_ICON_APP = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
</svg>`;

const FM_ICON_BACK = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5"
  stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <polyline points="30,12 18,24 30,36"/>
</svg>`;

const FM_ICON_PLAY = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 5v14l11-7z"/>
</svg>`;

const FM_ICON_FILM = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" rx="2"/>
  <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/>
</svg>`;

const FM_ICON_TV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="3" width="20" height="14" rx="2"/>
  <path d="M8 21h8m-4-4v4"/>
</svg>`;

const FM_ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
  stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 6 6 18M6 6l12 12"/>
</svg>`;

const FM_ICON_SEARCH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
</svg>`;

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const FM_LISTING_BASE      = 'https://vidapi.ru';
const FM_PLAYER_BASE       = 'https://vaplayer.ru';
const FM_PLAYER_COLOR      = '%2300e676';
const FM_BROWSE_BATCH_SIZE = 5;    // API pages fetched simultaneously per browse load
const FM_SEARCH_CHUNK_SIZE = 100;  // concurrent requests per search chunk
const FM_RESULTS_PER_PAGE  = 48;   // search results shown per display page

// ─────────────────────────────────────────────────────────────────────────────
// Persistent store
// ─────────────────────────────────────────────────────────────────────────────

const fmStore = Store.namespace('freemovies');

// ─────────────────────────────────────────────────────────────────────────────
// App registration
// ─────────────────────────────────────────────────────────────────────────────

AppRegistry.register({
  id:        'freemovies',
  name:      'Free Movies',
  icon:      FM_ICON_APP,
  removable: true,
  render:    renderFreeMoviesApp,
});

// ─────────────────────────────────────────────────────────────────────────────
// CSS — injected once into <head>, all classes namespaced with fm-
// ─────────────────────────────────────────────────────────────────────────────

const FM_STYLES = `
/* ── Root ── */
.fm-root {
  display: flex; flex-direction: column; height: 100%; overflow: hidden;
  background: var(--bg-primary); color: var(--text-primary);
  position: relative; font-family: var(--font);
}

/* ── Chrome bar ── */
.fm-chrome {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.fm-chrome-btn {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: none; background: none; color: var(--text-primary);
  cursor: pointer; flex-shrink: 0; transition: background 0.15s;
}
.fm-chrome-btn:active { background: var(--bg-tertiary); }
.fm-chrome-btn svg    { width: 20px; height: 20px; }
.fm-chrome-title {
  font-size: 16px; font-weight: 600; flex: 1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Tab bar ── */
.fm-tab-bar {
  display: flex; overflow-x: auto; scrollbar-width: none;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border);
  padding: 0 8px; gap: 2px; flex-shrink: 0;
}
.fm-tab-bar::-webkit-scrollbar { display: none; }
.fm-tab {
  background: none; border: none; border-bottom: 2px solid transparent;
  padding: 10px 14px 8px; font-size: 12px; font-weight: 600; font-family: var(--font);
  cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-secondary); white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.fm-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

/* ── Scrollable body ── */
.fm-body { flex: 1; overflow-y: auto; overflow-x: hidden; }
.fm-section.hidden { display: none; }

/* ── Card grid ── */
.fm-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px; padding: 14px;
}

/* ── Skeleton placeholders ── */
.fm-skel {
  aspect-ratio: 2/3; border-radius: var(--radius-sm);
  background: var(--bg-secondary); animation: fm-pulse 1.4s ease-in-out infinite;
}
@keyframes fm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Movie / TV cards ── */
.fm-card {
  position: relative; border-radius: var(--radius-sm); overflow: hidden;
  background: var(--bg-secondary); cursor: pointer; box-shadow: var(--shadow-sm);
  transition: transform 0.15s;
}
.fm-card:active { transform: scale(0.96); }
.fm-card-poster {
  width: 100%; aspect-ratio: 2/3; object-fit: cover;
  display: block; background: var(--bg-tertiary);
}
.fm-card-no-poster {
  width: 100%; aspect-ratio: 2/3; display: flex; align-items: center;
  justify-content: center; background: var(--bg-tertiary); color: var(--text-muted);
}
.fm-card-no-poster svg { width: 32px; height: 32px; opacity: 0.4; }
.fm-card-type-badge {
  position: absolute; top: 6px; left: 6px; font-size: 9px; font-weight: 700;
  letter-spacing: 0.5px; text-transform: uppercase; padding: 2px 5px;
  border-radius: 4px; backdrop-filter: blur(6px);
}
.fm-badge-movie { background: rgba(0,132,255,0.85); color: #fff; }
.fm-badge-tv    { background: rgba(255,149,0,0.85);  color: #fff; }
.fm-card-pl-btn {
  position: absolute; top: 6px; right: 6px; width: 22px; height: 22px;
  border-radius: 50%; border: none; background: rgba(0,0,0,0.65); color: #fff;
  font-size: 15px; line-height: 1; cursor: pointer; display: flex;
  align-items: center; justify-content: center; opacity: 0;
  transition: opacity 0.15s; backdrop-filter: blur(4px);
}
.fm-card:hover .fm-card-pl-btn { opacity: 1; }
.fm-card-play-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0); transition: background 0.2s;
}
.fm-card:hover .fm-card-play-overlay { background: rgba(0,0,0,0.35); }
.fm-play-ring {
  width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  color: #fff; opacity: 0; transition: opacity 0.2s;
}
.fm-card:hover .fm-play-ring { opacity: 1; }
.fm-play-ring svg { width: 20px; height: 20px; margin-left: 2px; }
.fm-card-footer { padding: 6px 8px 8px; }
.fm-card-title {
  font-size: 11px; font-weight: 600; line-height: 1.3; overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  color: var(--text-primary);
}
.fm-card-meta {
  display: flex; align-items: center; justify-content: space-between; margin-top: 3px;
}
.fm-card-year   { font-size: 10px; color: var(--text-muted); }
.fm-card-rating { font-size: 10px; color: #f5a623; font-weight: 600; }

/* ── Pagination ── */
.fm-pagination {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 12px 16px 20px;
}
.fm-page-btn {
  background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font);
  font-size: 13px; font-weight: 600; padding: 8px 16px; cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.fm-page-btn:disabled { opacity: 0.35; cursor: default; }
.fm-page-btn:not(:disabled):active { background: var(--bg-tertiary); }
.fm-page-label { font-size: 12px; color: var(--text-secondary); min-width: 80px; text-align: center; }

/* ── Search section ── */
.fm-search-bar {
  display: flex; gap: 8px; padding: 12px 14px;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.fm-search-input {
  flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font);
  font-size: 14px; padding: 8px 12px; outline: none; transition: border-color 0.15s;
}
.fm-search-input:focus { border-color: var(--accent); }
.fm-search-go {
  background: var(--accent); border: none; border-radius: var(--radius-sm);
  color: #fff; font-family: var(--font); font-size: 13px; font-weight: 600;
  padding: 8px 16px; cursor: pointer; white-space: nowrap;
}
.fm-search-status-row {
  display: flex; align-items: center; padding: 6px 14px; min-height: 30px;
  border-bottom: 1px solid var(--border);
}
.fm-search-status { font-size: 11px; color: var(--text-secondary); flex: 1; }
.fm-search-stop {
  background: none; border: 1px solid var(--border); border-radius: 4px;
  color: var(--text-secondary); font-family: var(--font); font-size: 11px;
  padding: 2px 8px; cursor: pointer;
}

/* ── Player modal ── */
.fm-player-modal {
  position: absolute; inset: 0; background: #000; z-index: 100;
  display: flex; flex-direction: column; overflow: hidden;
}
.fm-player-modal.hidden { display: none; }
.fm-player-chrome {
  display: flex; align-items: center; gap: 10px; padding: 8px 14px;
  background: linear-gradient(180deg, #1e1e1e 0%, #131313 100%);
  border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
  /* Explicit white base color so every child inherits it, not var(--text-primary) */
  color: #fff;
}
.fm-player-close {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border: none; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6);
  cursor: pointer; border-radius: 8px; transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.fm-player-close:hover  { background: rgba(255,255,255,0.15); color: #fff; }
.fm-player-close:active { background: rgba(255,255,255,0.22); color: #fff; }
.fm-player-close svg    { width: 16px; height: 16px; }
.fm-player-title {
  flex: 1; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.8);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: 0.1px;
}
.fm-player-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.fm-player-action-btn {
  display: flex; align-items: center; gap: 5px;
  /* Force white — global button reset sets background:none, we override here */
  background: rgba(255,255,255,0.1) !important;
  color: rgba(255,255,255,0.75) !important;
  border: 1px solid rgba(255,255,255,0.14);
  font-family: var(--font); font-size: 11px; font-weight: 600;
  padding: 5px 11px; border-radius: 20px; cursor: pointer;
  letter-spacing: 0.3px; transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap; line-height: 1;
}
.fm-player-action-btn svg    { width: 13px; height: 13px; flex-shrink: 0; stroke: currentColor; }
.fm-player-action-btn:hover  { background: rgba(255,255,255,0.18) !important; color: #fff !important; border-color: rgba(255,255,255,0.25); }
.fm-player-action-btn:active { background: rgba(255,255,255,0.25) !important; }
.fm-player-dev-btn           { color: #00e676 !important; border-color: rgba(0,230,118,0.3); }
.fm-player-dev-btn:hover     { background: rgba(0,230,118,0.15) !important; color: #00e676 !important; border-color: rgba(0,230,118,0.5); }
.fm-player-dev-btn.active    { background: rgba(0,230,118,0.2)  !important; color: #00e676 !important; border-color: rgba(0,230,118,0.6); }
.fm-player-iframe  { flex: 1; width: 100%; border: none; background: #000; }
.fm-progress-bar   { height: 2px; background: rgba(255,255,255,0.1); flex-shrink: 0; }
.fm-progress-fill  { height: 100%; background: #00e676; width: 0%; transition: width 1s linear; }

/* ── Dev panel (backtick while player open) ── */
.fm-dev-panel {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(10,10,14,0.97); border-top: 1px solid #333;
  padding: 12px 14px; z-index: 150; display: flex; flex-direction: column;
  gap: 8px; font-family: monospace; font-size: 12px; color: #0f0;
  max-height: 50%; overflow-y: auto;
}
.fm-dev-panel.hidden { display: none; }
.fm-dev-row   { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.fm-dev-label { color: #888; min-width: 56px; font-size: 11px; }
.fm-dev-input {
  background: #1a1a1a; border: 1px solid #333; border-radius: 4px;
  color: #0f0; font-family: monospace; font-size: 12px; padding: 4px 8px;
  flex: 1; outline: none;
}
.fm-dev-input:focus { border-color: #0f0; }
.fm-dev-select {
  background: #1a1a1a; border: 1px solid #333; border-radius: 4px;
  color: #0f0; font-family: monospace; font-size: 12px; padding: 4px 6px; outline: none;
}
.fm-dev-btn {
  background: #1a1a1a; border: 1px solid #444; border-radius: 4px; color: #aaa;
  font-family: monospace; font-size: 11px; padding: 4px 8px; cursor: pointer;
  white-space: nowrap; transition: background 0.1s, color 0.1s;
}
.fm-dev-btn:active  { background: #333; color: #0f0; }
.fm-dev-btn.primary { border-color: #0f0; color: #0f0; }
.fm-dev-info { font-size: 10px; color: #555; word-break: break-all; padding-top: 2px; }

/* ── Profile section ── */
.fm-profile-body { padding: 14px; display: flex; flex-direction: column; gap: 16px; }
.fm-card-section {
  background: var(--bg-secondary); border-radius: var(--radius);
  border: 1px solid var(--border); padding: 12px 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.fm-section-header { display: flex; align-items: center; justify-content: space-between; }
.fm-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; color: var(--accent);
}
.fm-btn-sm {
  background: none; border: 1px solid var(--border); border-radius: 6px;
  color: var(--text-secondary); font-family: var(--font); font-size: 11px;
  padding: 3px 8px; cursor: pointer; transition: background 0.1s;
}
.fm-btn-sm:active      { background: var(--bg-tertiary); }
.fm-btn-sm.danger      { color: var(--danger); border-color: var(--danger); }
.fm-btn-sm.accent-fill { background: var(--accent); color: #fff; border-color: var(--accent); }

/* ── History items ── */
.fm-history-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid var(--border); cursor: pointer;
}
.fm-history-item:last-child { border-bottom: none; }
.fm-h-thumb {
  width: 36px; height: 54px; border-radius: 4px; object-fit: cover;
  background: var(--bg-tertiary); flex-shrink: 0;
}
.fm-h-thumb-ph {
  width: 36px; height: 54px; border-radius: 4px; background: var(--bg-tertiary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--text-muted);
}
.fm-h-thumb-ph svg { width: 18px; height: 18px; opacity: 0.5; }
.fm-h-info { flex: 1; min-width: 0; }
.fm-h-title {
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.fm-h-meta  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.fm-empty-msg { font-size: 12px; color: var(--text-muted); text-align: center; padding: 16px 0; }

/* ── Playlist list ── */
.fm-playlist-wrapper {
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  overflow: hidden; background: var(--bg-secondary);
}
.fm-pl-header {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  cursor: pointer; background: var(--bg-secondary); transition: background 0.1s;
}
.fm-pl-header:active { background: var(--bg-tertiary); }
.fm-pl-name  { flex: 1; font-size: 13px; font-weight: 600; color: var(--text-primary); }
.fm-pl-count { font-size: 11px; color: var(--text-muted); }
.fm-pl-del-btn {
  background: none; border: none; color: var(--danger); font-size: 14px; cursor: pointer; padding: 2px 4px;
}
.fm-pl-items { display: none; border-top: 1px solid var(--border); background: var(--bg-primary); }
.fm-pl-items.open { display: block; }
.fm-pl-item-row {
  display: flex; align-items: center; gap: 6px; padding: 7px 12px;
  border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.1s;
}
.fm-pl-item-row:last-child { border-bottom: none; }
.fm-pl-item-row:active { background: var(--bg-tertiary); }
.fm-pl-item-title {
  flex: 1; font-size: 12px; color: var(--text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.fm-pl-item-year { font-size: 10px; color: var(--text-muted); margin-right: 4px; }
.fm-pl-item-del {
  background: none; border: none; color: var(--text-muted);
  font-size: 12px; cursor: pointer; padding: 2px 4px; flex-shrink: 0;
}
.fm-new-pl-form  { display: flex; gap: 6px; }
.fm-new-pl-input {
  flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font);
  font-size: 13px; padding: 7px 10px; outline: none;
}
.fm-new-pl-input:focus { border-color: var(--accent); }

/* ── Playlist picker bottom sheet ── */
.fm-pl-picker {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 50;
  display: flex; align-items: flex-end; backdrop-filter: blur(4px);
}
.fm-pl-picker.hidden { display: none; }
.fm-pl-picker-sheet {
  width: 100%; background: var(--bg-secondary); border-radius: 16px 16px 0 0;
  padding: 16px; max-height: 60%; overflow-y: auto;
  display: flex; flex-direction: column; gap: 8px;
}
.fm-pl-picker-heading { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.fm-pl-pick-btn {
  background: var(--bg-tertiary); border: none; border-radius: var(--radius-sm);
  color: var(--text-primary); font-family: var(--font); font-size: 13px;
  padding: 10px 12px; cursor: pointer; text-align: left; transition: background 0.1s;
}
.fm-pl-pick-btn:active { background: var(--border); }

/* ── Toast notifications ── */
.fm-toast-rack {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  z-index: 200; display: flex; flex-direction: column; align-items: center;
  gap: 6px; pointer-events: none;
}
.fm-toast {
  background: rgba(30,30,32,0.92); color: #fff; font-size: 12px; font-weight: 500;
  padding: 7px 16px; border-radius: 20px; white-space: nowrap;
  opacity: 0; transform: translateY(6px); transition: opacity 0.18s, transform 0.18s;
  backdrop-filter: blur(8px); pointer-events: none;
}
.fm-toast.green { background: rgba(48,209,88,0.9); color: #000; }
.fm-toast.show  { opacity: 1; transform: translateY(0); }

/* ── Login / disclaimer gate ── */
.fm-gate {
  position: absolute; inset: 0; background: var(--bg-primary); z-index: 300;
  display: flex; align-items: center; justify-content: center;
  padding: 20px; overflow-y: auto;
}
.fm-gate.hidden { display: none; }
.fm-gate-card {
  background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px 20px; max-width: 340px; width: 100%;
  display: flex; flex-direction: column; gap: 16px; box-shadow: var(--shadow);
}
.fm-gate-title   { font-size: 20px; font-weight: 800; text-align: center; color: var(--text-primary); margin: 0; letter-spacing: -0.3px; }
.fm-gate-section { display: flex; flex-direction: column; gap: 8px; }
.fm-gate-lead    { font-size: 13px; color: var(--text-secondary); line-height: 1.55; margin: 0; }
.fm-gate-list    {
  margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 5px;
  font-size: 13px; color: var(--text-secondary); line-height: 1.5;
}
.fm-gate-list li strong { color: var(--text-primary); }
.fm-gate-sue {
  background: rgba(255,59,48,0.08); border: 1px solid rgba(255,59,48,0.2);
  border-radius: var(--radius-sm); padding: 10px 12px;
  font-size: 12px; color: var(--danger); line-height: 1.5; text-align: center;
}
.fm-gate-sue strong { display: block; font-size: 13px; margin-bottom: 2px; }
.fm-gate-divider { height: 1px; background: var(--border); }
.fm-gate-input {
  width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font);
  font-size: 14px; padding: 10px 12px; outline: none; transition: border-color 0.15s;
  box-sizing: border-box;
}
.fm-gate-input:focus { border-color: var(--accent); }
.fm-gate-input.shake { animation: fm-shake 0.35s ease; border-color: var(--danger); }
@keyframes fm-shake {
  0%,100% { transform: translateX(0); }
  20%,60%  { transform: translateX(-6px); }
  40%,80%  { transform: translateX(6px); }
}
.fm-gate-btn {
  background: var(--accent); border: none; border-radius: var(--radius-sm);
  color: #fff; font-family: var(--font); font-size: 14px; font-weight: 700;
  padding: 13px 16px; cursor: pointer; width: 100%; transition: background 0.15s;
  letter-spacing: 0.1px;
}
.fm-gate-btn:active { background: var(--accent-hover); }
.fm-gate-footnote  { font-size: 10px; color: var(--text-muted); text-align: center; margin: 0; line-height: 1.5; }
`;

function fmInjectStyles() {
  // Always replace so CSS edits take effect without a full page reload
  const existing = document.querySelector('style[data-app="freemovies"]');
  if (existing) existing.remove();
  const styleTag = document.createElement('style');
  styleTag.setAttribute('data-app', 'freemovies');
  styleTag.textContent = FM_STYLES;
  document.head.appendChild(styleTag);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main render entry point
// ─────────────────────────────────────────────────────────────────────────────

function renderFreeMoviesApp(container) {
  fmInjectStyles();

  // Scoped DOM query helper — avoids collisions with other apps
  const $ = (id) => container.querySelector(`#${id}`);

  // ── Mutable state ──────────────────────────────────────────────────────────
  let activeTab       = 'movies';
  let activeMoviePage = 1;
  let activeTvPage    = 1;
  let nowPlayingItem  = null;
  let devPanelOpen    = false;

  // ── Key cleanup list (document-level listeners removed on exit) ────────────
  const documentListeners = [];
  function addDocumentListener(event, handler) {
    document.addEventListener(event, handler);
    documentListeners.push({ event, handler });
  }
  function removeAllDocumentListeners() {
    documentListeners.forEach(({ event, handler }) => document.removeEventListener(event, handler));
  }

  // ── HTML skeleton ──────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="fm-root">

      <!-- Chrome -->
      <div class="fm-chrome">
        <button class="fm-chrome-btn" id="fm-back">${FM_ICON_BACK}</button>
        <span class="fm-chrome-title">Free Movies</span>
        <button class="fm-chrome-btn" id="fm-search-toggle" title="Search">${FM_ICON_SEARCH}</button>
      </div>

      <!-- Tab bar -->
      <div class="fm-tab-bar" id="fm-tab-bar">
        <button class="fm-tab active" data-tab="movies">Movies</button>
        <button class="fm-tab"        data-tab="tv">TV Shows</button>
        <button class="fm-tab"        data-tab="profile">Profile</button>
      </div>

      <!-- Scrollable body -->
      <div class="fm-body" id="fm-body">

        <!-- Movies section -->
        <div class="fm-section" id="fm-movies-section">
          <div class="fm-grid" id="fm-movies-grid"></div>
          <div class="fm-pagination">
            <button class="fm-page-btn" id="fm-movies-prev" disabled>← Prev</button>
            <span class="fm-page-label" id="fm-movies-page">—</span>
            <button class="fm-page-btn" id="fm-movies-next">Next →</button>
          </div>
        </div>

        <!-- TV section -->
        <div class="fm-section hidden" id="fm-tv-section">
          <div class="fm-grid" id="fm-tv-grid"></div>
          <div class="fm-pagination">
            <button class="fm-page-btn" id="fm-tv-prev" disabled>← Prev</button>
            <span class="fm-page-label" id="fm-tv-page">—</span>
            <button class="fm-page-btn" id="fm-tv-next">Next →</button>
          </div>
        </div>

        <!-- Search section -->
        <div class="fm-section hidden" id="fm-search-section">
          <div class="fm-search-bar">
            <input class="fm-search-input" id="fm-search-input" placeholder="Search movies &amp; TV shows…" autocomplete="off"/>
            <button class="fm-search-go" id="fm-search-go">Search</button>
          </div>
          <div class="fm-search-status-row" id="fm-search-status-row" style="display:none">
            <span class="fm-search-status" id="fm-search-status"></span>
            <button class="fm-search-stop" id="fm-search-stop">stop</button>
          </div>
          <div class="fm-grid" id="fm-search-grid"></div>
          <div class="fm-pagination" id="fm-search-pagination" style="display:none">
            <button class="fm-page-btn" id="fm-search-prev">← Prev</button>
            <span class="fm-page-label" id="fm-search-page">—</span>
            <button class="fm-page-btn" id="fm-search-next">Next →</button>
          </div>
        </div>

        <!-- Profile section -->
        <div class="fm-section hidden" id="fm-profile-section">
          <div class="fm-profile-body">

            <!-- Watch history -->
            <div class="fm-card-section">
              <div class="fm-section-header">
                <span class="fm-section-title">Watch History</span>
                <button class="fm-btn-sm danger" id="fm-clear-history">Clear</button>
              </div>
              <div id="fm-history-list"></div>
            </div>

            <!-- Playlists -->
            <div class="fm-card-section">
              <div class="fm-section-header">
                <span class="fm-section-title">Playlists</span>
                <button class="fm-btn-sm" id="fm-new-pl-toggle">+ New</button>
              </div>
              <div class="fm-new-pl-form" id="fm-new-pl-form" style="display:none">
                <input class="fm-new-pl-input" id="fm-new-pl-name" placeholder="Playlist name…"/>
                <button class="fm-btn-sm accent-fill" id="fm-create-pl">Create</button>
                <button class="fm-btn-sm" id="fm-cancel-pl">✕</button>
              </div>
              <div id="fm-playlist-list"></div>
            </div>

            <!-- Export / Import -->
            <div class="fm-card-section">
              <div class="fm-section-header">
                <span class="fm-section-title">Data</span>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="fm-btn-sm" id="fm-export-btn">Export JSON</button>
                <label class="fm-btn-sm" style="cursor:pointer">
                  Import JSON
                  <input type="file" id="fm-import-input" accept=".json" multiple style="display:none"/>
                </label>
              </div>
            </div>

          </div>
        </div>

      </div><!-- /fm-body -->

      <!-- Full-screen player (position:absolute, lives inside fm-root) -->
      <div class="fm-player-modal hidden" id="fm-player-modal">
        <div class="fm-player-chrome">
          <button class="fm-player-close" id="fm-player-close">${FM_ICON_CLOSE}</button>
          <span class="fm-player-title" id="fm-player-title"></span>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <button id="fm-player-save-btn" title="Add to playlist" style="
              display:flex;align-items:center;gap:5px;border:none;cursor:pointer;
              background:rgba(255,255,255,0.12);color:#fff;
              font-size:11px;font-weight:600;letter-spacing:0.3px;
              padding:5px 11px;border-radius:20px;white-space:nowrap;line-height:1;
              font-family:inherit;transition:background 0.15s;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Playlist</span>
            </button>
            <button id="fm-player-dev-toggle" title="Toggle dev panel" style="
              display:flex;align-items:center;gap:5px;border:none;cursor:pointer;
              background:rgba(0,230,118,0.15);color:#00e676;
              border:1px solid rgba(0,230,118,0.35);
              font-size:11px;font-weight:700;letter-spacing:0.4px;
              padding:5px 11px;border-radius:20px;white-space:nowrap;line-height:1;
              font-family:inherit;transition:background 0.15s;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#00e676" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span>Dev</span>
            </button>
          </div>
        </div>
        <div class="fm-progress-bar">
          <div class="fm-progress-fill" id="fm-progress-fill"></div>
        </div>
        <iframe class="fm-player-iframe" id="fm-player-iframe"
          allowfullscreen allow="autoplay; fullscreen; encrypted-media"></iframe>

        <!-- Dev panel lives inside the player overlay -->
        <div class="fm-dev-panel hidden" id="fm-dev-panel">
          <div class="fm-dev-row">
            <span class="fm-dev-label">ID</span>
            <input class="fm-dev-input" id="fm-dev-id" placeholder="imdb / tmdb id"/>
            <select class="fm-dev-select" id="fm-dev-type">
              <option value="movie">movie</option>
              <option value="tv">tv</option>
            </select>
          </div>
          <div class="fm-dev-row" id="fm-dev-tv-row" style="display:none">
            <span class="fm-dev-label">S / E</span>
            <input class="fm-dev-input" id="fm-dev-season"  placeholder="season"  value="1" style="max-width:70px"/>
            <input class="fm-dev-input" id="fm-dev-episode" placeholder="episode" value="1" style="max-width:70px"/>
            <button class="fm-dev-btn" id="fm-dev-prev-ep">−ep</button>
            <button class="fm-dev-btn" id="fm-dev-next-ep">+ep</button>
            <button class="fm-dev-btn" id="fm-dev-prev-s">−s</button>
            <button class="fm-dev-btn" id="fm-dev-next-s">+s</button>
          </div>
          <div class="fm-dev-row">
            <span class="fm-dev-label">URL</span>
            <input class="fm-dev-input" id="fm-dev-custom-url" placeholder="or paste full URL…"/>
          </div>
          <div class="fm-dev-row">
            <button class="fm-dev-btn primary" id="fm-dev-apply">Apply</button>
          </div>
          <div class="fm-dev-info" id="fm-dev-info"></div>
        </div>
      </div>

      <!-- Playlist picker bottom sheet -->
      <div class="fm-pl-picker hidden" id="fm-pl-picker">
        <div class="fm-pl-picker-sheet">
          <div class="fm-pl-picker-heading">Add to playlist</div>
          <div id="fm-pl-picker-list"></div>
          <button class="fm-btn-sm" id="fm-pl-picker-close" style="margin-top:4px">Cancel</button>
        </div>
      </div>

      <!-- Toast rack -->
      <div class="fm-toast-rack" id="fm-toast-rack"></div>

      <!-- Disclaimer + login gate — shown on first open, blocks playback until accepted -->
      <div class="fm-gate hidden" id="fm-gate">
        <div class="fm-gate-card">
          <h2 class="fm-gate-title">Before You Watch</h2>

          <div class="fm-gate-section">
            <p class="fm-gate-lead">
              This app streams content from a <strong>third-party website</strong>
              that we have absolutely <strong>zero</strong> control over.
            </p>
            <ul class="fm-gate-list">
              <li>We do <strong>not</strong> host, own, or maintain any content</li>
              <li>We make <strong>no guarantees</strong> about availability or legality</li>
              <li>The service can go down at any moment without warning</li>
              <li>We are <strong>not responsible</strong> for anything that happens</li>
            </ul>
          </div>

          <div class="fm-gate-sue">
            <strong>Legal Notice</strong>
            If you have a problem with the content — take it up with the provider, not us.
            We are simply a frontend. Sue <em>them</em>, not us.
          </div>

          <div class="fm-gate-divider"></div>

          <div class="fm-gate-section">
            <p class="fm-gate-lead">Enter a display name to continue:</p>
            <input class="fm-gate-input" id="fm-gate-name"
              placeholder="Your name…" maxlength="24" autocomplete="off" autocorrect="off"/>
          </div>

          <button class="fm-gate-btn" id="fm-gate-accept">I Understand — Let Me In</button>
          <p class="fm-gate-footnote">
            No password needed. Your name is only stored locally on this device.
            By continuing you accept all of the above.
          </p>
        </div>
      </div>

    </div>
  `;

  // ── Utilities ────────────────────────────────────────────────────────────────

  function fmEsc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmPad2(number) {
    return String(number).padStart(2, '0');
  }

  function fmFormatTime(totalSeconds) {
    if (!totalSeconds) return '0:00';
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return hours > 0
      ? `${hours}:${fmPad2(minutes)}:${fmPad2(seconds)}`
      : `${minutes}:${fmPad2(seconds)}`;
  }

  function fmToast(message, isSuccess = false) {
    const rack    = $('fm-toast-rack');
    const toastEl = document.createElement('div');
    toastEl.className = 'fm-toast' + (isSuccess ? ' green' : '');
    toastEl.textContent = message;
    rack.appendChild(toastEl);
    requestAnimationFrame(() => toastEl.classList.add('show'));
    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.remove(), 200);
    }, 2400);
  }

  // ── Embed URL builders ────────────────────────────────────────────────────────

  function fmResumeParam(storageKey) {
    const savedProgress = fmStore.get(`prog_${storageKey}`);
    return savedProgress ? `&resumeAt=${savedProgress}` : '';
  }

  function fmBuildMovieEmbedUrl(item) {
    const mediaId = item.imdb_id || item.tmdb_id || item.id;
    return `${FM_PLAYER_BASE}/embed/movie/${mediaId}?primaryColor=${FM_PLAYER_COLOR}&skin=disney${fmResumeParam(mediaId)}`;
  }

  function fmBuildTvEmbedUrl(item, season, episode) {
    const mediaId   = item.imdb_id || item.tmdb_id || item.id;
    const resumeKey = `${mediaId}_${season}_${episode}`;
    return `${FM_PLAYER_BASE}/embed/tv/${mediaId}/${season}/${episode}?primaryColor=${FM_PLAYER_COLOR}&skin=disney${fmResumeParam(resumeKey)}`;
  }

  // ── Gate (login + disclaimer) ─────────────────────────────────────────────────

  function fmGetUser() {
    return fmStore.get('user') ?? null;
  }

  function fmAcceptGate(displayName) {
    fmStore.set('user', { name: displayName, acceptedAt: new Date().toISOString() });
    $('fm-gate').classList.add('hidden');
    fmToast(`Welcome, ${displayName}!`, true);
  }

  function fmShowGate() {
    $('fm-gate-name').value = '';
    $('fm-gate').classList.remove('hidden');
    setTimeout(() => $('fm-gate-name').focus(), 80);
  }

  // ── Player ────────────────────────────────────────────────────────────────────

  function fmOpenPlayer(embedUrl, titleText, item) {
    // Gate: must have accepted disclaimer before watching anything
    if (!fmGetUser()) {
      fmShowGate();
      return;
    }
    $('fm-player-iframe').src             = embedUrl;
    $('fm-player-title').textContent      = titleText;
    $('fm-progress-fill').style.width     = '0%';
    $('fm-player-modal').classList.remove('hidden');
    nowPlayingItem = item ?? null;
    if (item) fmAddToHistory(item);
  }

  function fmClosePlayer() {
    $('fm-player-iframe').src = '';
    $('fm-player-modal').classList.add('hidden');
    fmCloseDevPanel();
    nowPlayingItem = null;
  }

  // ── History ───────────────────────────────────────────────────────────────────

  function fmGetHistory() {
    return fmStore.get('history') ?? [];
  }

  function fmAddToHistory(item) {
    const itemId   = item.imdb_id || item.tmdb_id || item.id || 'unknown';
    const existing = fmGetHistory().filter(entry => entry.id !== itemId);
    existing.unshift({
      id:        itemId,
      title:     item.title      || 'Unknown',
      mediaType: item._type      || 'movie',
      year:      item.year       || '',
      posterUrl: item.poster_url || '',
      watchedAt: new Date().toISOString(),
    });
    fmStore.set('history', existing.slice(0, 200));
  }

  function fmRenderHistory() {
    const historyItems = fmGetHistory();
    const listEl       = $('fm-history-list');
    if (!historyItems.length) {
      listEl.innerHTML = '<p class="fm-empty-msg">No history yet — start watching!</p>';
      return;
    }
    listEl.innerHTML = '';
    historyItems.forEach(entry => {
      const rowEl = document.createElement('div');
      rowEl.className = 'fm-history-item';
      const thumbHtml = entry.posterUrl
        ? `<img class="fm-h-thumb" src="${fmEsc(entry.posterUrl)}" alt="" loading="lazy">`
        : `<div class="fm-h-thumb-ph">${entry.mediaType === 'tv' ? FM_ICON_TV : FM_ICON_FILM}</div>`;
      const watchedDate = new Date(entry.watchedAt).toLocaleDateString();
      rowEl.innerHTML = `
        ${thumbHtml}
        <div class="fm-h-info">
          <div class="fm-h-title">${fmEsc(entry.title)}</div>
          <div class="fm-h-meta">${entry.mediaType}${entry.year ? ' · ' + entry.year : ''} · ${watchedDate}</div>
        </div>`;
      rowEl.addEventListener('click', () => {
        const embedUrl = entry.mediaType === 'tv'
          ? fmBuildTvEmbedUrl(entry, 1, 1)
          : fmBuildMovieEmbedUrl(entry);
        fmOpenPlayer(embedUrl, entry.title, entry);
      });
      listEl.appendChild(rowEl);
    });
  }

  // ── Playlists ─────────────────────────────────────────────────────────────────

  function fmGetPlaylists()          { return fmStore.get('playlists') ?? []; }
  function fmSavePlaylists(lists)    { fmStore.set('playlists', lists); }

  function fmSeedStarterPlaylist() {
    if (fmStore.get('starterSeeded')) return;

    const starterItems = [
      // ── Movies ──
      { id: 'tt0468569', title: 'The Dark Knight',                   mediaType: 'movie', year: '2008', posterUrl: '' },
      { id: 'tt1375666', title: 'Inception',                         mediaType: 'movie', year: '2010', posterUrl: '' },
      { id: 'tt0816692', title: 'Interstellar',                      mediaType: 'movie', year: '2014', posterUrl: '' },
      { id: 'tt0111161', title: 'The Shawshank Redemption',          mediaType: 'movie', year: '1994', posterUrl: '' },
      { id: 'tt0110912', title: 'Pulp Fiction',                      mediaType: 'movie', year: '1994', posterUrl: '' },
      { id: 'tt6751668', title: 'Parasite',                          mediaType: 'movie', year: '2019', posterUrl: '' },
      { id: 'tt6710474', title: 'Everything Everywhere All at Once', mediaType: 'movie', year: '2022', posterUrl: '' },
      { id: 'tt1160419', title: 'Dune',                              mediaType: 'movie', year: '2021', posterUrl: '' },
      { id: 'tt1745960', title: 'Top Gun: Maverick',                 mediaType: 'movie', year: '2022', posterUrl: '' },
      { id: 'tt2278388', title: 'The Grand Budapest Hotel',          mediaType: 'movie', year: '2014', posterUrl: '' },
      { id: 'tt0137523', title: 'Fight Club',                        mediaType: 'movie', year: '1999', posterUrl: '' },
      { id: 'tt0109830', title: 'Forrest Gump',                      mediaType: 'movie', year: '1994', posterUrl: '' },
      { id: 'tt0133093', title: 'The Matrix',                        mediaType: 'movie', year: '1999', posterUrl: '' },
      { id: 'tt0245429', title: 'Spirited Away',                     mediaType: 'movie', year: '2001', posterUrl: '' },
      { id: 'tt0317248', title: 'City of God',                       mediaType: 'movie', year: '2002', posterUrl: '' },
      // ── TV Shows ──
      { id: 'tt0903747',  title: 'Breaking Bad',     mediaType: 'tv', year: '2008', posterUrl: '' },
      { id: 'tt0944947',  title: 'Game of Thrones',  mediaType: 'tv', year: '2011', posterUrl: '' },
      { id: 'tt4574334',  title: 'Stranger Things',  mediaType: 'tv', year: '2016', posterUrl: '' },
      { id: 'tt14452776', title: 'The Bear',         mediaType: 'tv', year: '2022', posterUrl: '' },
      { id: 'tt11280740', title: 'Severance',        mediaType: 'tv', year: '2022', posterUrl: '' },
      { id: 'tt3581920',  title: 'The Last of Us',   mediaType: 'tv', year: '2023', posterUrl: '' },
      { id: 'tt4834232',  title: 'Succession',       mediaType: 'tv', year: '2018', posterUrl: '' },
      { id: 'tt7366338',  title: 'Chernobyl',        mediaType: 'tv', year: '2019', posterUrl: '' },
      { id: 'tt2085059',  title: 'Black Mirror',     mediaType: 'tv', year: '2011', posterUrl: '' },
      { id: 'tt0386676',  title: 'The Office',       mediaType: 'tv', year: '2005', posterUrl: '' },
      { id: 'tt2861424',  title: 'Rick and Morty',   mediaType: 'tv', year: '2013', posterUrl: '' },
      { id: 'tt0773262',  title: 'Dexter',           mediaType: 'tv', year: '2006', posterUrl: '' },
      { id: 'tt0455275',  title: 'Prison Break',     mediaType: 'tv', year: '2005', posterUrl: '' },
      { id: 'tt1520211',  title: 'The Walking Dead', mediaType: 'tv', year: '2010', posterUrl: '' },
      { id: 'tt0096697',  title: 'The Simpsons',     mediaType: 'tv', year: '1989', posterUrl: '' },
    ];

    const existingLists = fmGetPlaylists();
    existingLists.unshift({ id: 'fm-starter', name: '🎬 Staff Picks', items: starterItems });
    fmSavePlaylists(existingLists);
    fmStore.set('starterSeeded', true);
  }

  function fmCreatePlaylist(name) {
    const lists = fmGetPlaylists();
    lists.push({ id: Date.now().toString(), name, items: [] });
    fmSavePlaylists(lists);
  }

  function fmDeletePlaylist(playlistId) {
    fmSavePlaylists(fmGetPlaylists().filter(pl => pl.id !== playlistId));
  }

  function fmAddToPlaylist(playlistId, item) {
    const lists      = fmGetPlaylists();
    const targetList = lists.find(pl => pl.id === playlistId);
    if (!targetList) return;
    const itemId = item.imdb_id || item.tmdb_id || item.id;
    if (targetList.items.find(existing => existing.id === itemId)) return;
    targetList.items.push({
      id:        itemId,
      title:     item.title      || 'Unknown',
      mediaType: item._type      || 'movie',
      year:      item.year       || '',
      posterUrl: item.poster_url || '',
    });
    fmSavePlaylists(lists);
  }

  function fmRemoveFromPlaylist(playlistId, itemId) {
    const lists      = fmGetPlaylists();
    const targetList = lists.find(pl => pl.id === playlistId);
    if (!targetList) return;
    targetList.items = targetList.items.filter(entry => entry.id !== itemId);
    fmSavePlaylists(lists);
  }

  function fmRenderPlaylists() {
    const lists  = fmGetPlaylists();
    const listEl = $('fm-playlist-list');
    if (!lists.length) {
      listEl.innerHTML = '<p class="fm-empty-msg">No playlists yet — create one above.</p>';
      return;
    }
    listEl.innerHTML = '';
    lists.forEach(playlist => {
      const wrapperEl = document.createElement('div');
      wrapperEl.className = 'fm-playlist-wrapper';

      const headerEl = document.createElement('div');
      headerEl.className = 'fm-pl-header';
      headerEl.innerHTML = `
        <span class="fm-pl-name">${fmEsc(playlist.name)}</span>
        <span class="fm-pl-count">${playlist.items.length} items</span>
        <button class="fm-pl-del-btn" title="Delete playlist">✕</button>`;
      headerEl.querySelector('.fm-pl-del-btn').addEventListener('click', event => {
        event.stopPropagation();
        fmDeletePlaylist(playlist.id);
        fmRenderPlaylists();
      });

      const itemsEl = document.createElement('div');
      itemsEl.className = 'fm-pl-items';

      if (playlist.items.length) {
        playlist.items.forEach(entry => {
          const rowEl = document.createElement('div');
          rowEl.className = 'fm-pl-item-row';
          rowEl.innerHTML = `
            <span class="fm-pl-item-title">${fmEsc(entry.title)}</span>
            <span class="fm-pl-item-year">${fmEsc(entry.year)}</span>
            <button class="fm-pl-item-del" title="Remove">✕</button>`;
          rowEl.querySelector('.fm-pl-item-del').addEventListener('click', event => {
            event.stopPropagation();
            fmRemoveFromPlaylist(playlist.id, entry.id);
            fmRenderPlaylists();
          });
          rowEl.addEventListener('click', () => {
            const embedUrl = entry.mediaType === 'tv'
              ? fmBuildTvEmbedUrl(entry, 1, 1)
              : fmBuildMovieEmbedUrl(entry);
            fmOpenPlayer(embedUrl, entry.title, entry);
          });
          itemsEl.appendChild(rowEl);
        });
      } else {
        itemsEl.innerHTML = '<p style="font-size:11px;color:var(--text-muted);padding:8px 12px">Empty playlist</p>';
      }

      headerEl.addEventListener('click', () => itemsEl.classList.toggle('open'));
      wrapperEl.appendChild(headerEl);
      wrapperEl.appendChild(itemsEl);
      listEl.appendChild(wrapperEl);
    });
  }

  function fmOpenPlaylistPicker(item) {
    const lists        = fmGetPlaylists();
    const pickerListEl = $('fm-pl-picker-list');
    pickerListEl.innerHTML = '';
    if (!lists.length) {
      pickerListEl.innerHTML = '<p style="font-size:12px;color:var(--text-muted)">No playlists — create one in Profile.</p>';
    } else {
      lists.forEach(playlist => {
        const btn = document.createElement('button');
        btn.className   = 'fm-pl-pick-btn';
        btn.textContent = `${playlist.name} (${playlist.items.length})`;
        btn.addEventListener('click', () => {
          fmAddToPlaylist(playlist.id, item);
          $('fm-pl-picker').classList.add('hidden');
          fmToast(`Added to "${playlist.name}"`, true);
        });
        pickerListEl.appendChild(btn);
      });
    }
    $('fm-pl-picker').classList.remove('hidden');
  }

  // ── Card builder ──────────────────────────────────────────────────────────────

  function fmBuildCard(item, mediaType) {
    item._type = mediaType;
    const cardEl = document.createElement('div');
    cardEl.className = 'fm-card';

    const posterHtml = item.poster_url
      ? `<img class="fm-card-poster" src="${fmEsc(item.poster_url)}" alt="${fmEsc(item.title)}" loading="lazy">`
      : `<div class="fm-card-no-poster">${mediaType === 'movie' ? FM_ICON_FILM : FM_ICON_TV}</div>`;

    const ratingHtml = item.rating
      ? `<span class="fm-card-rating">★${item.rating}</span>`
      : '';

    cardEl.innerHTML = `
      ${posterHtml}
      <span class="fm-card-type-badge ${mediaType === 'movie' ? 'fm-badge-movie' : 'fm-badge-tv'}">${mediaType}</span>
      <button class="fm-card-pl-btn" title="Add to playlist">+</button>
      <div class="fm-card-play-overlay">
        <div class="fm-play-ring">${FM_ICON_PLAY}</div>
      </div>
      <div class="fm-card-footer">
        <div class="fm-card-title">${fmEsc(item.title)}</div>
        <div class="fm-card-meta">
          <span class="fm-card-year">${fmEsc(item.year || '—')}</span>
          ${ratingHtml}
        </div>
      </div>`;

    cardEl.querySelector('.fm-card-pl-btn').addEventListener('click', event => {
      event.stopPropagation();
      fmOpenPlaylistPicker(item);
    });
    cardEl.addEventListener('click', () => {
      const embedUrl = mediaType === 'movie'
        ? fmBuildMovieEmbedUrl(item)
        : fmBuildTvEmbedUrl(item, 1, 1);
      fmOpenPlayer(embedUrl, item.title, item);
    });
    return cardEl;
  }

  // ── Browse grid loader ────────────────────────────────────────────────────────
  // Renders FM_BROWSE_BATCH_SIZE pages worth of skeleton slots immediately,
  // then swaps each group of slots for real cards as each page resolves.

  async function fmLoadGrid(gridEl, apiEndpoint, mediaType, startPage) {
    gridEl.innerHTML = '';
    const pageNumbers = Array.from({ length: FM_BROWSE_BATCH_SIZE }, (_, i) => startPage + i);

    const skeletonGroups = pageNumbers.map(() =>
      Array.from({ length: 24 }).map(() => {
        const skelEl = document.createElement('div');
        skelEl.className = 'fm-skel';
        gridEl.appendChild(skelEl);
        return skelEl;
      })
    );

    let discoveredTotalPages = pageNumbers[pageNumbers.length - 1];

    await Promise.all(pageNumbers.map(async (pageNum, groupIndex) => {
      let responseData;
      try {
        responseData = await Http.get(`${FM_LISTING_BASE}/${apiEndpoint}/page-${pageNum}.json`);
      } catch {
        skeletonGroups[groupIndex].forEach(skelEl => skelEl.remove());
        return;
      }

      if (responseData.total_pages > discoveredTotalPages) {
        discoveredTotalPages = responseData.total_pages;
      }

      const skeletons = skeletonGroups[groupIndex];
      responseData.items.forEach((item, index) => {
        const cardEl = fmBuildCard(item, mediaType);
        if (skeletons[index]) skeletons[index].replaceWith(cardEl);
      });
      skeletons.slice(responseData.items.length).forEach(skelEl => skelEl.remove());
    }));

    return discoveredTotalPages;
  }

  async function fmLoadMovies(startPage = 1) {
    const totalPages = await fmLoadGrid($('fm-movies-grid'), 'movies/latest', 'movie', startPage);
    const endPage    = Math.min(startPage + FM_BROWSE_BATCH_SIZE - 1, totalPages);
    $('fm-movies-page').textContent = `${startPage}–${endPage} / ${totalPages}`;
    $('fm-movies-prev').disabled    = startPage <= 1;
    $('fm-movies-next').disabled    = endPage >= totalPages;
    activeMoviePage = startPage;
    $('fm-body').scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function fmLoadTv(startPage = 1) {
    const totalPages = await fmLoadGrid($('fm-tv-grid'), 'tvshows/latest', 'tv', startPage);
    const endPage    = Math.min(startPage + FM_BROWSE_BATCH_SIZE - 1, totalPages);
    $('fm-tv-page').textContent = `${startPage}–${endPage} / ${totalPages}`;
    $('fm-tv-prev').disabled    = startPage <= 1;
    $('fm-tv-next').disabled    = endPage >= totalPages;
    activeTvPage = startPage;
    $('fm-body').scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Search ────────────────────────────────────────────────────────────────────
  // Progressive scan: streams hits live as each 100-page chunk resolves.
  // Both movie and TV endpoints run in parallel via Promise.all.

  const fmSearch = {
    query:         '',
    allResults:    [],
    movieMaxPages: 0,
    tvMaxPages:    0,
    nextMoviePage: 1,
    nextTvPage:    1,
    running:       false,
    stopped:       false,
    displayPage:   0,
  };

  function fmResetSearch() {
    Object.assign(fmSearch, {
      query: '', allResults: [], movieMaxPages: 0, tvMaxPages: 0,
      nextMoviePage: 1, nextTvPage: 1, running: false, stopped: false, displayPage: 0,
    });
  }

  async function fmStartSearch(query) {
    fmResetSearch();
    fmSearch.query = query;
    $('fm-search-grid').innerHTML           = '';
    $('fm-search-status-row').style.display = 'flex';
    $('fm-search-pagination').style.display = 'none';
    fmSetSearchStatus('Scanning…', true);
    await fmRunSearchBatch();
  }

  async function fmRunSearchBatch() {
    if (fmSearch.running || fmSearch.stopped) return;
    fmSearch.running = true;

    const moviePages = fmBuildPageRange(fmSearch.nextMoviePage, fmSearch.movieMaxPages);
    const tvPages    = fmBuildPageRange(fmSearch.nextTvPage,    fmSearch.tvMaxPages);

    if (!moviePages.length && !tvPages.length) {
      fmSearch.running = false;
      fmFinishSearch();
      return;
    }

    const queryLower = fmSearch.query.toLowerCase();

    function scoreTitle(title) {
      const lower = title.toLowerCase();
      if (lower === queryLower)             return 0;
      if (lower.startsWith(queryLower))     return 1;
      if (lower.includes(' ' + queryLower)) return 2;
      return 3;
    }

    // Streams one endpoint: fetches FM_SEARCH_CHUNK_SIZE pages at a time,
    // inserts hits into allResults and re-renders after every chunk.
    async function streamEndpoint(apiEndpoint, pages, mediaType) {
      for (let chunkStart = 0; chunkStart < pages.length; chunkStart += FM_SEARCH_CHUNK_SIZE) {
        if (fmSearch.stopped) break;
        const chunk = pages.slice(chunkStart, chunkStart + FM_SEARCH_CHUNK_SIZE);

        const chunkResults = await Promise.all(
          chunk.map(pageNum =>
            Http.get(`${FM_LISTING_BASE}/${apiEndpoint}/page-${pageNum}.json`).catch(() => null)
          )
        );

        // Capture total pages from the first valid response for this type
        if (mediaType === 'movie' && !fmSearch.movieMaxPages) {
          fmSearch.movieMaxPages = chunkResults.find(Boolean)?.total_pages ?? 0;
        }
        if (mediaType === 'tv' && !fmSearch.tvMaxPages) {
          fmSearch.tvMaxPages = chunkResults.find(Boolean)?.total_pages ?? 0;
        }

        const hits = chunkResults
          .flatMap(result => result?.items ?? [])
          .filter(item => item.title.toLowerCase().includes(queryLower))
          .map(item => ({ ...item, _type: mediaType }));

        if (hits.length) {
          fmSearch.allResults.push(...hits);
          fmSearch.allResults.sort((a, b) => scoreTitle(a.title) - scoreTitle(b.title));
          fmRenderSearchPage(fmSearch.displayPage);
        }

        const totalPages = (fmSearch.movieMaxPages || 0) + (fmSearch.tvMaxPages || 0);
        fmSetSearchStatus(
          `${fmSearch.allResults.length} found — scanned ${chunkStart + chunk.length} / ${totalPages || '?'} pages`,
          true
        );
      }
    }

    // Both endpoints stream simultaneously — whichever finishes a chunk first
    // renders its hits without waiting for the other to catch up.
    await Promise.all([
      streamEndpoint('movies/latest',   moviePages, 'movie'),
      streamEndpoint('tvshows/latest',  tvPages,    'tv'),
    ]);

    fmSearch.nextMoviePage += moviePages.length;
    fmSearch.nextTvPage    += tvPages.length;
    fmSearch.running = false;

    const moviesDone = !moviePages.length || fmSearch.nextMoviePage > (fmSearch.movieMaxPages || Infinity);
    const tvDone     = !tvPages.length    || fmSearch.nextTvPage    > (fmSearch.tvMaxPages    || Infinity);

    if (moviesDone && tvDone) {
      fmFinishSearch();
    } else if (!fmSearch.stopped) {
      setTimeout(fmRunSearchBatch, 0);
    }
  }

  // Returns an array of page numbers to fetch, capped at knownMaxPages
  function fmBuildPageRange(startPage, knownMaxPages) {
    if (knownMaxPages && startPage > knownMaxPages) return [];
    const endPage = knownMaxPages
      ? Math.min(startPage + FM_SEARCH_CHUNK_SIZE - 1, knownMaxPages)
      : startPage + FM_SEARCH_CHUNK_SIZE - 1;
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  function fmFinishSearch() {
    fmSearch.stopped = true;
    const totalScanned = (fmSearch.movieMaxPages || 0) + (fmSearch.tvMaxPages || 0);
    if (!fmSearch.allResults.length) {
      fmSetSearchStatus(`No results across ${totalScanned} pages — try an IMDb ID (tt…) or TMDB number`);
      $('fm-search-grid').innerHTML = '<p class="fm-empty-msg">Nothing found</p>';
    } else {
      fmSetSearchStatus(`${fmSearch.allResults.length} result${fmSearch.allResults.length !== 1 ? 's' : ''} — ${totalScanned} pages scanned`);
    }
    $('fm-search-status-row').style.display = 'none';
  }

  function fmSetSearchStatus(message, showStop = false) {
    $('fm-search-status').textContent        = message;
    $('fm-search-stop').style.display        = showStop ? '' : 'none';
    $('fm-search-status-row').style.display  = 'flex';
  }

  function fmRenderSearchPage(page) {
    fmSearch.displayPage = page;
    const totalResults = fmSearch.allResults.length;
    if (!totalResults) return;

    const totalPages = Math.ceil(totalResults / FM_RESULTS_PER_PAGE);
    const sliceStart = page * FM_RESULTS_PER_PAGE;
    const pageSlice  = fmSearch.allResults.slice(sliceStart, sliceStart + FM_RESULTS_PER_PAGE);

    $('fm-search-pagination').style.display = 'flex';
    $('fm-search-page').textContent         = `${page + 1} / ${totalPages}`;
    $('fm-search-prev').disabled            = page <= 0;
    $('fm-search-next').disabled            = page >= totalPages - 1;

    $('fm-search-grid').innerHTML = '';
    pageSlice.forEach(item => $('fm-search-grid').appendChild(fmBuildCard(item, item._type)));
    $('fm-body').scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Tab switching ─────────────────────────────────────────────────────────────

  function fmSwitchTab(tabName) {
    activeTab = tabName;
    container.querySelectorAll('.fm-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    container.querySelectorAll('.fm-section').forEach(section => {
      section.classList.toggle('hidden', section.id !== `fm-${tabName}-section`);
    });
    if (tabName === 'tv'      && !$('fm-tv-grid').children.length) fmLoadTv(1);
    if (tabName === 'profile') { fmRenderHistory(); fmRenderPlaylists(); fmRenderAccountCard(); }
  }

  // ── Dev panel (` while player open) ──────────────────────────────────────────

  function fmOpenDevPanel() {
    devPanelOpen = true;
    $('fm-dev-panel').classList.remove('hidden');
    fmSyncDevFromPlayer();
  }

  function fmCloseDevPanel() {
    devPanelOpen = false;
    $('fm-dev-panel').classList.add('hidden');
  }

  function fmSyncDevFromPlayer() {
    const src = $('fm-player-iframe').src;
    if (!src) return;
    $('fm-dev-info').textContent = src;
    const tvMatch    = src.match(/\/embed\/tv\/([^/]+)\/(\d+)\/(\d+)/);
    const movieMatch = src.match(/\/embed\/movie\/([^?]+)/);
    if (tvMatch) {
      $('fm-dev-id').value      = tvMatch[1];
      $('fm-dev-type').value    = 'tv';
      $('fm-dev-season').value  = tvMatch[2];
      $('fm-dev-episode').value = tvMatch[3];
      $('fm-dev-tv-row').style.display = 'flex';
    } else if (movieMatch) {
      $('fm-dev-id').value   = movieMatch[1];
      $('fm-dev-type').value = 'movie';
      $('fm-dev-tv-row').style.display = 'none';
    }
  }

  function fmApplyDevPanel() {
    const customUrl = $('fm-dev-custom-url').value.trim();
    if (customUrl) {
      $('fm-player-iframe').src        = customUrl;
      $('fm-dev-info').textContent     = customUrl;
      return;
    }
    const mediaId = $('fm-dev-id').value.trim();
    if (!mediaId) return;
    const mediaType = $('fm-dev-type').value;
    const season    = parseInt($('fm-dev-season').value)  || 1;
    const episode   = parseInt($('fm-dev-episode').value) || 1;
    const newUrl = mediaType === 'tv'
      ? `${FM_PLAYER_BASE}/embed/tv/${mediaId}/${season}/${episode}?primaryColor=${FM_PLAYER_COLOR}&skin=disney`
      : `${FM_PLAYER_BASE}/embed/movie/${mediaId}?primaryColor=${FM_PLAYER_COLOR}&skin=disney`;
    $('fm-player-iframe').src        = newUrl;
    $('fm-player-title').textContent = mediaType === 'tv'
      ? `${mediaId} — S${fmPad2(season)}E${fmPad2(episode)}`
      : mediaId;
    $('fm-dev-info').textContent = newUrl;
  }

  // ── Export / Import ───────────────────────────────────────────────────────────

  function fmExportData() {
    const payload = {
      exported:  new Date().toISOString(),
      history:   fmGetHistory(),
      playlists: fmGetPlaylists(),
    };
    const blob   = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href     = URL.createObjectURL(blob);
    anchor.download = `freemovies-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    fmToast('Exported!', true);
  }

  async function fmImportFile(file) {
    try {
      const data = JSON.parse(await file.text());

      if (Array.isArray(data.playlists)) {
        const existing = fmGetPlaylists();
        data.playlists.forEach(imported => {
          const match = existing.find(pl => pl.name === imported.name);
          if (!match) {
            existing.push({ ...imported, id: `${Date.now()}${Math.random()}` });
          } else {
            imported.items.forEach(importedItem => {
              if (!match.items.find(e => e.id === importedItem.id)) match.items.push(importedItem);
            });
          }
        });
        fmSavePlaylists(existing);
      }

      if (Array.isArray(data.history)) {
        const existing    = fmGetHistory();
        const existingIds = new Set(existing.map(e => e.id));
        data.history.forEach(entry => { if (!existingIds.has(entry.id)) existing.push(entry); });
        fmStore.set('history', existing.slice(0, 200));
      }
    } catch (error) {
      console.warn('FreeMovies: import failed for', file.name, error);
    }
  }

  // ── Event wiring ──────────────────────────────────────────────────────────────

  // Back — clean up document listeners then go home
  $('fm-back').addEventListener('click', () => {
    removeAllDocumentListeners();
    Router.home();
  });

  // Tab bar
  container.querySelectorAll('.fm-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => fmSwitchTab(tabBtn.dataset.tab));
  });

  // Search icon in chrome — open search section
  $('fm-search-toggle').addEventListener('click', () => {
    container.querySelectorAll('.fm-section').forEach(s => s.classList.add('hidden'));
    $('fm-search-section').classList.remove('hidden');
    container.querySelectorAll('.fm-tab').forEach(btn => btn.classList.remove('active'));
    setTimeout(() => $('fm-search-input').focus(), 50);
  });

  // Search input + button
  $('fm-search-go').addEventListener('click', () => {
    const query = $('fm-search-input').value.trim();
    if (query) fmStartSearch(query);
  });
  $('fm-search-input').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const query = $('fm-search-input').value.trim();
      if (query) fmStartSearch(query);
    }
  });
  $('fm-search-stop').addEventListener('click', () => {
    fmSearch.stopped = true;
    fmSearch.running = false;
    fmFinishSearch();
  });
  $('fm-search-prev').addEventListener('click', () => fmRenderSearchPage(fmSearch.displayPage - 1));
  $('fm-search-next').addEventListener('click', () => fmRenderSearchPage(fmSearch.displayPage + 1));

  // Browse pagination
  $('fm-movies-prev').addEventListener('click', () => fmLoadMovies(Math.max(1, activeMoviePage - FM_BROWSE_BATCH_SIZE)));
  $('fm-movies-next').addEventListener('click', () => fmLoadMovies(activeMoviePage + FM_BROWSE_BATCH_SIZE));
  $('fm-tv-prev').addEventListener('click',     () => fmLoadTv(Math.max(1, activeTvPage - FM_BROWSE_BATCH_SIZE)));
  $('fm-tv-next').addEventListener('click',     () => fmLoadTv(activeTvPage + FM_BROWSE_BATCH_SIZE));

  // Player close + action buttons
  $('fm-player-close').addEventListener('click', fmClosePlayer);
  $('fm-player-save-btn').addEventListener('click', () => {
    if (nowPlayingItem) fmOpenPlaylistPicker(nowPlayingItem);
  });
  $('fm-player-dev-toggle').addEventListener('click', () => {
    const devToggleBtn = $('fm-player-dev-toggle');
    if (devPanelOpen) {
      fmCloseDevPanel();
      devToggleBtn.classList.remove('active');
    } else {
      fmOpenDevPanel();
      devToggleBtn.classList.add('active');
    }
  });

  // postMessage from player iframe — progress tracking + auto-next episode
  addDocumentListener('message', event => {
    if (!event.data || event.data.type !== 'PLAYER_EVENT') return;
    const { player_info, player_status, player_progress, player_duration } = event.data.data;

    if (player_status === 'playing' || player_status === 'paused') {
      const progressKey = player_info.season != null
        ? `${player_info.imdb || player_info.tmdb}_${player_info.season}_${player_info.episode}`
        : `${player_info.imdb || player_info.tmdb}`;
      fmStore.set(`prog_${progressKey}`, player_progress);
      $('fm-progress-fill').style.width = player_duration > 0
        ? `${(player_progress / player_duration) * 100}%`
        : '0%';
    }

    if (player_status === 'completed' && player_info.mediaType === 'tv') {
      const showItem  = { imdb_id: player_info.imdb, tmdb_id: player_info.tmdb, title: player_info.title, _type: 'tv' };
      const nextEp    = parseInt(player_info.episode) + 1;
      const nextTitle = `${player_info.title} — S${fmPad2(player_info.season)}E${fmPad2(nextEp)}`;
      fmOpenPlayer(fmBuildTvEmbedUrl(showItem, player_info.season, nextEp), nextTitle, showItem);
    }
  });

  // Escape closes picker or player
  addDocumentListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!$('fm-pl-picker').classList.contains('hidden')) {
      $('fm-pl-picker').classList.add('hidden');
    } else if (!$('fm-player-modal').classList.contains('hidden')) {
      fmClosePlayer();
    }
  });

  // Backtick / tilde toggles dev panel while player is open
  addDocumentListener('keydown', event => {
    if (event.key !== '`' && event.key !== '~') return;
    if (!$('fm-player-modal').classList.contains('hidden')) {
      event.preventDefault();
      devPanelOpen ? fmCloseDevPanel() : fmOpenDevPanel();
    }
  });

  // Dev panel controls
  $('fm-dev-type').addEventListener('change', () => {
    $('fm-dev-tv-row').style.display = $('fm-dev-type').value === 'tv' ? 'flex' : 'none';
  });
  $('fm-dev-apply').addEventListener('click', fmApplyDevPanel);
  [$('fm-dev-id'), $('fm-dev-season'), $('fm-dev-episode'), $('fm-dev-custom-url')].forEach(input => {
    input.addEventListener('keydown', event => { if (event.key === 'Enter') fmApplyDevPanel(); });
  });
  $('fm-dev-prev-ep').addEventListener('click', () => {
    $('fm-dev-episode').value = Math.max(1, (parseInt($('fm-dev-episode').value) || 1) - 1);
    fmApplyDevPanel();
  });
  $('fm-dev-next-ep').addEventListener('click', () => {
    $('fm-dev-episode').value = (parseInt($('fm-dev-episode').value) || 1) + 1;
    fmApplyDevPanel();
  });
  $('fm-dev-prev-s').addEventListener('click', () => {
    $('fm-dev-season').value  = Math.max(1, (parseInt($('fm-dev-season').value) || 1) - 1);
    $('fm-dev-episode').value = 1;
    fmApplyDevPanel();
  });
  $('fm-dev-next-s').addEventListener('click', () => {
    $('fm-dev-season').value  = (parseInt($('fm-dev-season').value) || 1) + 1;
    $('fm-dev-episode').value = 1;
    fmApplyDevPanel();
  });

  // Playlist picker close
  $('fm-pl-picker-close').addEventListener('click', () => $('fm-pl-picker').classList.add('hidden'));
  $('fm-pl-picker').addEventListener('click', event => {
    if (event.target === $('fm-pl-picker')) $('fm-pl-picker').classList.add('hidden');
  });

  // Profile — clear history
  $('fm-clear-history').addEventListener('click', () => {
    fmStore.set('history', []);
    fmRenderHistory();
    fmToast('History cleared');
  });

  // Profile — new playlist form
  $('fm-new-pl-toggle').addEventListener('click', () => {
    const form = $('fm-new-pl-form');
    const isVisible = form.style.display !== 'none';
    form.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) $('fm-new-pl-name').focus();
  });
  $('fm-cancel-pl').addEventListener('click', () => {
    $('fm-new-pl-form').style.display = 'none';
    $('fm-new-pl-name').value = '';
  });
  $('fm-create-pl').addEventListener('click', () => {
    const name = $('fm-new-pl-name').value.trim();
    if (!name) return;
    fmCreatePlaylist(name);
    $('fm-new-pl-name').value         = '';
    $('fm-new-pl-form').style.display = 'none';
    fmRenderPlaylists();
    fmToast(`"${name}" created`, true);
  });
  $('fm-new-pl-name').addEventListener('keydown', event => {
    if (event.key === 'Enter')  $('fm-create-pl').click();
    if (event.key === 'Escape') $('fm-cancel-pl').click();
  });

  // Profile — export / import
  $('fm-export-btn').addEventListener('click', fmExportData);
  $('fm-import-input').addEventListener('change', async event => {
    for (const file of [...event.target.files]) await fmImportFile(file);
    event.target.value = '';
    fmRenderHistory();
    fmRenderPlaylists();
    fmToast('Imported!', true);
  });

  // ── Gate wiring ───────────────────────────────────────────────────────────────

  $('fm-gate-accept').addEventListener('click', () => {
    const displayName = $('fm-gate-name').value.trim();
    if (!displayName) {
      const input = $('fm-gate-name');
      input.classList.add('shake');
      input.focus();
      setTimeout(() => input.classList.remove('shake'), 400);
      return;
    }
    fmAcceptGate(displayName);
  });

  $('fm-gate-name').addEventListener('keydown', event => {
    if (event.key === 'Enter') $('fm-gate-accept').click();
  });

  // ── Account card in Profile — show logged-in user + logout ────────────────────
  function fmRenderAccountCard() {
    const user = fmGetUser();
    if (!user) return;

    // Remove existing account card if re-rendering
    const existing = $('fm-account-card');
    if (existing) existing.remove();

    const cardEl = document.createElement('div');
    cardEl.className = 'fm-card-section';
    cardEl.id        = 'fm-account-card';
    cardEl.innerHTML = `
      <div class="fm-section-header">
        <span class="fm-section-title">Account</span>
        <button class="fm-btn-sm danger" id="fm-logout-btn">Log out</button>
      </div>
      <div style="font-size:14px;font-weight:600;color:var(--text-primary)">
        ${fmEsc(user.name)}
      </div>
      <div style="font-size:11px;color:var(--text-muted)">
        Watching since ${new Date(user.acceptedAt).toLocaleDateString()}
      </div>`;

    // Insert as the first card in the profile body
    const profileBody = container.querySelector('.fm-profile-body');
    profileBody.insertBefore(cardEl, profileBody.firstChild);

    cardEl.querySelector('#fm-logout-btn').addEventListener('click', () => {
      fmStore.remove('user');
      fmRenderAccountCard();
      fmShowGate();
    });
  }

  // ── Initial data load + gate check ───────────────────────────────────────────
  fmSeedStarterPlaylist();
  fmLoadMovies(1);

  // Show gate on first open if user hasn't accepted yet
  if (!fmGetUser()) {
    fmShowGate();
  }

} // end renderFreeMoviesApp

