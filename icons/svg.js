const BASE = `viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"`;
const STATUS = `viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"`;

export const LOGO = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><text x="-2" y="44" font-family="Arial Black,sans-serif" font-weight="900" font-size="46" fill="currentColor" letter-spacing="-3">P</text><text x="24" y="44" font-family="Arial Black,sans-serif" font-weight="900" font-size="46" fill="none" stroke="currentColor" stroke-width="2" letter-spacing="-3">0</text></svg>`;

// ── App icons ──────────────────────────────────────────────────

export const ICON_CLOCK = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm10-6a1 1 0 0 1 1 1v4.586l2.707 2.707a1 1 0 0 1-1.414 1.414l-3-3A1 1 0 0 1 11 12V7a1 1 0 0 1 1-1z"/>
</svg>`;

export const ICON_CALCULATOR = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 21h-8c-1.7 0-3-1.3-3-3v-12c0-1.7 1.3-3 3-3h8c1.7 0 3 1.3 3 3v12c0 1.7-1.3 3-3 3zm-8-16c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-12c0-.6-.4-1-1-1h-8z"/>
  <circle cx="10" cy="11" r="1"/>
  <circle cx="13" cy="11" r="1"/>
  <circle cx="16" cy="11" r="1"/>
  <circle cx="10" cy="14" r="1"/>
  <circle cx="13" cy="14" r="1"/>
  <circle cx="16" cy="14" r="1"/>
  <circle cx="10" cy="17" r="1"/>
  <circle cx="13" cy="17" r="1"/>
  <circle cx="16" cy="17" r="1"/>
  <path d="M16 7v1h-6v-1h6m1-1h-8v3h8v-3z"/>
</svg>`;

export const ICON_NOTES = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 2h16v20H3V2h2zm14 18V4H5v16h14zM7 6h10v2H7V6zm10 4H7v2h10v-2zM7 14h7v2H7v-2z"/>
</svg>`;

export const ICON_TODO = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="m20.215 2.387-8.258 10.547-2.704-3.092a1 1 0 1 0-1.506 1.316l3.103 3.548a1.5 1.5 0 0 0 2.31-.063L21.79 3.62a1 1 0 1 0-1.575-1.233zM20 11a1 1 0 0 0-1 1v6.077c0 .459-.021.57-.082.684a.364.364 0 0 1-.157.157c-.113.06-.225.082-.684.082H5.923c-.459 0-.57-.022-.684-.082a.363.363 0 0 1-.157-.157c-.06-.113-.082-.225-.082-.684V5.5a.5.5 0 0 1 .5-.5l8.5.004a1 1 0 1 0 0-2L5.5 3A2.5 2.5 0 0 0 3 5.5v12.577c0 .76.082 1.185.319 1.627.224.419.558.753.977.977.442.237.866.319 1.627.319h12.154c.76 0 1.185-.082 1.627-.319.42-.224.754-.558.978-.977.236-.442.318-.866.318-1.627V12a1 1 0 0 0-1-1z"/>
</svg>`;

export const ICON_CALENDAR = `<svg viewBox="-2 -3 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 7V5a1 1 0 0 0-1-1h-1v1a1 1 0 0 1-2 0V4H6v1a1 1 0 1 1-2 0V4H3a1 1 0 0 0-1 1v2h16zm0 2H2v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9zm-2-7h1a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h1V1a1 1 0 1 1 2 0v1h8V1a1 1 0 0 1 2 0v1z"/>
</svg>`;

export const ICON_WEATHER = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 18c-.553 0-1-.447-1-1s.447-1 1-1c1.654 0 3-1.346 3-3s-1.346-3-3-3c-.238 0-.496.042-.813.131l-1.071.301-.186-1.098c-.326-1.932-1.979-3.334-3.93-3.334-2.205 0-4 1.794-4 4 0 .274.027.545.082.806l.26 1.24-1.436-.052c-1.01.006-1.906.903-1.906 2.006s.896 2 2 2c.553 0 1 .447 1 1s-.447 1-1 1c-2.205 0-4-1.794-4-4 0-1.861 1.277-3.429 3.002-3.874l-.002-.126c0-3.309 2.691-6 6-6 2.587 0 4.824 1.638 5.649 4.015 2.925-.241 5.351 2.112 5.351 4.985 0 2.757-2.243 5-5 5zM12.639 14l-4.5 4.051 3 1.449-1.5 3.5 4.5-4.05-3-1.45z"/>
</svg>`;

export const ICON_MUSIC = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 18V5l12-2v13"/>
  <circle cx="6" cy="18" r="3"/>
  <circle cx="18" cy="16" r="3"/>
</svg>`;

export const ICON_BROWSER = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M43 16V42H5V16"/>
  <path d="M5 4H43V16H5V4Z"/>
  <circle cx="11" cy="10" r="2" fill="currentColor" stroke="none"/>
  <circle cx="17" cy="10" r="2" fill="currentColor" stroke="none"/>
  <circle cx="23" cy="10" r="2" fill="currentColor" stroke="none"/>
</svg>`;

export const ICON_SETTINGS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>`;

export const ICON_STORE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 22L12 13M12 22L9.5 20M12 22L14.5 20"/>
  <path d="M5.03426 9.11737C3.29168 9.54938 2 11.1238 2 13C2 15.2091 3.79086 17 6 17C6 17 6.21895 17 7 17"/>
  <path d="M15.83 7.13765C15.2238 4.75905 13.0673 3 10.5 3C7.46243 3 5 5.46243 5 8.5C5 8.70871 5.01163 8.9147 5.03426 9.11736C5.03426 9.11736 5.1875 10 5.5 10.5"/>
  <path d="M17 17C19.7614 17 22 14.7614 22 12C22 9.23858 19.7614 7 17 7C16.5971 7 16.2053 7.04766 15.83 7.13765L14.5 7.5"/>
</svg>`;

export const ICON_SNAKE = `<svg ${BASE}>
  <polyline points="10,38 10,16 26,16 26,30 38,30 38,16"/>
  <rect x="32" y="10" width="11" height="9" rx="3" fill="currentColor" stroke="none"/>
  <circle cx="14" cy="43" r="3.5" fill="currentColor" stroke="none"/>
</svg>`;

// ── UI icons ───────────────────────────────────────────────────

export const ICON_BACK    = `<svg ${BASE}><polyline points="30,12 18,24 30,36"/></svg>`;
export const ICON_FORWARD = `<svg ${BASE}><polyline points="18,12 30,24 18,36"/></svg>`;
export const ICON_CLOSE   = `<svg ${BASE}><line x1="14" y1="14" x2="34" y2="34"/><line x1="34" y1="14" x2="14" y2="34"/></svg>`;
export const ICON_PLUS    = `<svg ${BASE}><line x1="24" y1="10" x2="24" y2="38"/><line x1="10" y1="24" x2="38" y2="24"/></svg>`;

export const ICON_TRASH = `<svg ${BASE}>
  <polyline points="12,14 36,14"/>
  <path d="M18 14 V10 Q18 8 20 8 H28 Q30 8 30 10 V14"/>
  <path d="M14 14 L16 40 Q16 42 18 42 H30 Q32 42 32 40 L34 14"/>
  <line x1="20" y1="22" x2="20" y2="36"/>
  <line x1="28" y1="22" x2="28" y2="36"/>
</svg>`;

export const ICON_EDIT = `<svg ${BASE}>
  <path d="M32 10 L38 16 L18 36 L10 38 L12 30 Z"/>
  <line x1="28" y1="14" x2="34" y2="20"/>
</svg>`;

export const ICON_SEARCH = `<svg ${BASE}>
  <circle cx="21" cy="21" r="12"/>
  <line x1="30" y1="30" x2="40" y2="40"/>
</svg>`;

export const ICON_CHECK = `<svg ${BASE}><polyline points="10,24 19,33 38,14"/></svg>`;

export const ICON_HOME = `<svg ${BASE}>
  <polyline points="6,24 24,8 42,24"/>
  <path d="M14 24 V40 Q14 42 16 42 H32 Q34 42 34 40 V24"/>
  <rect x="20" y="32" width="8" height="10" rx="1"/>
</svg>`;

export const ICON_REFRESH = `<svg ${BASE}>
  <path d="M38 24 A14 14 0 1 1 30 11"/>
  <polyline points="30,6 30,12 36,12"/>
</svg>`;

// ── Status bar icons ───────────────────────────────────────────

export const ICON_WIFI = `<svg ${STATUS}>
  <path d="M2 8 Q10 1 18 8"/>
  <path d="M5 11 Q10 6.5 15 11"/>
  <path d="M8 14 Q10 12 12 14"/>
  <circle cx="10" cy="17" r="1.2" fill="currentColor" stroke="none"/>
</svg>`;

export const ICON_BATTERY = `<svg ${STATUS}>
  <rect x="1" y="6" width="15" height="8" rx="2"/>
  <line x1="17" y1="8.5" x2="17" y2="11.5" stroke-width="2"/>
  <rect x="2.5" y="7.5" width="8" height="5" rx="1" fill="currentColor" stroke="none"/>
</svg>`;

// ── Weather condition icons ────────────────────────────────────

export const ICON_SUN = `<svg ${BASE}>
  <circle cx="24" cy="24" r="9"/>
  <line x1="24" y1="5"  x2="24" y2="9"/>
  <line x1="24" y1="39" x2="24" y2="43"/>
  <line x1="5"  y1="24" x2="9"  y2="24"/>
  <line x1="39" y1="24" x2="43" y2="24"/>
  <line x1="11.6" y1="11.6" x2="14.4" y2="14.4"/>
  <line x1="33.6" y1="33.6" x2="36.4" y2="36.4"/>
  <line x1="36.4" y1="11.6" x2="33.6" y2="14.4"/>
  <line x1="14.4" y1="33.6" x2="11.6" y2="36.4"/>
</svg>`;

export const ICON_CLOUD = `<svg ${BASE}>
  <path d="M12 36 Q5 36 5 28 Q5 22 12 22 Q13 14 20 13 Q29 12 31 20 Q38 20 38 27 Q38 36 29 36 Z"/>
</svg>`;

export const ICON_RAIN = `<svg ${BASE}>
  <path d="M12 28 Q5 28 5 20 Q5 14 12 14 Q13 6 20 5 Q29 4 31 12 Q38 12 38 19 Q38 28 29 28 Z"/>
  <line x1="14" y1="34" x2="12" y2="42"/>
  <line x1="22" y1="34" x2="20" y2="42"/>
  <line x1="30" y1="34" x2="28" y2="42"/>
</svg>`;

export const ICON_SNOW = `<svg ${BASE}>
  <path d="M12 28 Q5 28 5 20 Q5 14 12 14 Q13 6 20 5 Q29 4 31 12 Q38 12 38 19 Q38 28 29 28 Z"/>
  <line x1="16" y1="34" x2="16" y2="44"/>
  <line x1="11" y1="39" x2="21" y2="39"/>
  <line x1="28" y1="34" x2="28" y2="44"/>
  <line x1="23" y1="39" x2="33" y2="39"/>
</svg>`;

export const ICON_STORM = `<svg ${BASE}>
  <path d="M12 28 Q5 28 5 20 Q5 14 12 14 Q13 6 20 5 Q29 4 31 12 Q38 12 38 19 Q38 28 29 28 Z"/>
  <polyline points="24,28 20,36 26,36 21,46"/>
</svg>`;

export const ICON_WIND = `<svg ${BASE}>
  <path d="M6 18 Q18 18 20 14 Q22 10 18 10 Q14 10 14 14"/>
  <line x1="6" y1="24" x2="34" y2="24"/>
  <path d="M6 30 Q20 30 22 34 Q24 38 20 38 Q16 38 16 34"/>
</svg>`;

export const ICON_NIGHT = `<svg ${BASE}>
  <path d="M30 10 Q20 14 20 24 Q20 34 30 38 Q18 40 12 32 Q6 24 10 14 Q16 4 30 10 Z"/>
</svg>`;

export const ICON_PARTLY_CLOUDY = `<svg ${BASE}>
  <circle cx="19" cy="17" r="7"/>
  <line x1="19" y1="6"  x2="19" y2="8"/>
  <line x1="7"  y1="17" x2="9"  y2="17"/>
  <line x1="10.8" y1="8.8"  x2="12.3" y2="10.3"/>
  <line x1="27.2" y1="8.8"  x2="25.7" y2="10.3"/>
  <path d="M17 36 Q10 36 10 30 Q10 25 16 25 Q17 20 23 20 Q30 20 30 27 Q35 27 35 32 Q35 36 29 36 Z"/>
</svg>`;

// ── Control-center icons ───────────────────────────────────────

export const ICON_BRIGHTNESS = `<svg ${BASE}>
  <circle cx="24" cy="24" r="8"/>
  <line x1="24" y1="8"  x2="24" y2="12"/>
  <line x1="24" y1="36" x2="24" y2="40"/>
  <line x1="8"  y1="24" x2="12" y2="24"/>
  <line x1="36" y1="24" x2="40" y2="24"/>
  <line x1="13.4" y1="13.4" x2="16.2" y2="16.2"/>
  <line x1="31.8" y1="31.8" x2="34.6" y2="34.6"/>
  <line x1="34.6" y1="13.4" x2="31.8" y2="16.2"/>
  <line x1="16.2" y1="31.8" x2="13.4" y2="34.6"/>
</svg>`;

export const ICON_VOLUME = `<svg ${BASE}>
  <path d="M8 30 L8 18 L18 18 L28 9 L28 39 L18 30 Z" fill="currentColor" stroke="none"/>
  <path d="M33 18 Q39 21 39 24 Q39 27 33 30"/>
  <path d="M36 13 Q44 18 44 24 Q44 30 36 35"/>
</svg>`;

export const ICON_DARKMODE = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
</svg>`;
