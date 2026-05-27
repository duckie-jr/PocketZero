const BASE = `viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"`;
const STATUS = `viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"`;

export const LOGO = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><text x="-2" y="44" font-family="Arial Black,sans-serif" font-weight="900" font-size="46" fill="currentColor" letter-spacing="-3">P</text><text x="24" y="44" font-family="Arial Black,sans-serif" font-weight="900" font-size="46" fill="none" stroke="currentColor" stroke-width="2" letter-spacing="-3">0</text></svg>`;

// ── App icons ──────────────────────────────────────────────────

export const ICON_CLOCK = `<svg ${BASE}>
  <circle cx="24" cy="24" r="18"/>
  <line x1="24" y1="10" x2="24" y2="13"/>
  <line x1="24" y1="35" x2="24" y2="38"/>
  <line x1="10" y1="24" x2="13" y2="24"/>
  <line x1="35" y1="24" x2="38" y2="24"/>
  <line x1="24" y1="24" x2="24" y2="14"/>
  <line x1="24" y1="24" x2="32" y2="28"/>
  <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none"/>
</svg>`;

export const ICON_CALCULATOR = `<svg ${BASE}>
  <rect x="10" y="8" width="28" height="32" rx="4"/>
  <rect x="14" y="12" width="20" height="8" rx="2"/>
  <rect x="14" y="24" width="5" height="5" rx="1.5"/>
  <rect x="21.5" y="24" width="5" height="5" rx="1.5"/>
  <rect x="29" y="24" width="5" height="5" rx="1.5"/>
  <rect x="14" y="32" width="5" height="5" rx="1.5"/>
  <rect x="21.5" y="32" width="5" height="5" rx="1.5"/>
  <rect x="29" y="32" width="5" height="5" rx="1.5" fill="currentColor" stroke="none"/>
</svg>`;

export const ICON_NOTES = `<svg ${BASE}>
  <path d="M12 8 H30 L38 16 V40 Q38 42 36 42 H12 Q10 42 10 40 V10 Q10 8 12 8 Z"/>
  <polyline points="30,8 30,16 38,16"/>
  <line x1="16" y1="24" x2="32" y2="24"/>
  <line x1="16" y1="30" x2="32" y2="30"/>
  <line x1="16" y1="36" x2="26" y2="36"/>
</svg>`;

export const ICON_TODO = `<svg ${BASE}>
  <rect x="10" y="8" width="28" height="32" rx="3"/>
  <polyline points="16,20 19,23 24,16"/>
  <line x1="27" y1="19.5" x2="33" y2="19.5"/>
  <polyline points="16,30 19,33 24,26"/>
  <line x1="27" y1="29.5" x2="33" y2="29.5"/>
</svg>`;

export const ICON_CALENDAR = `<svg ${BASE}>
  <rect x="6" y="10" width="36" height="30" rx="3"/>
  <line x1="6" y1="18" x2="42" y2="18"/>
  <line x1="16" y1="6" x2="16" y2="14"/>
  <line x1="32" y1="6" x2="32" y2="14"/>
  <circle cx="16" cy="26" r="2" fill="currentColor" stroke="none"/>
  <circle cx="24" cy="26" r="2" fill="currentColor" stroke="none"/>
  <circle cx="32" cy="26" r="2" fill="currentColor" stroke="none"/>
  <circle cx="16" cy="34" r="2" fill="currentColor" stroke="none"/>
  <circle cx="24" cy="34" r="2" fill="currentColor" stroke="none"/>
</svg>`;

export const ICON_WEATHER = `<svg ${BASE}>
  <circle cx="19" cy="18" r="6"/>
  <line x1="19" y1="8"  x2="19" y2="10"/>
  <line x1="9"  y1="18" x2="11" y2="18"/>
  <line x1="19" y1="28" x2="19" y2="26"/>
  <line x1="29" y1="18" x2="27" y2="18"/>
  <line x1="11.7" y1="10.7" x2="13.1" y2="12.1"/>
  <line x1="26.3" y1="10.7" x2="24.9" y2="12.1"/>
  <path d="M16 40 Q9 40 9 33 Q9 27 16 27 Q17 22 23 22 Q30 22 30 29 Q35 29 35 34 Q35 40 28 40 Z"/>
</svg>`;

export const ICON_MUSIC = `<svg ${BASE}>
  <line x1="20" y1="36" x2="20" y2="14"/>
  <line x1="36" y1="32" x2="36" y2="10"/>
  <line x1="20" y1="14" x2="36" y2="10"/>
  <circle cx="16" cy="36" r="4"/>
  <circle cx="32" cy="32" r="4"/>
</svg>`;

export const ICON_BROWSER = `<svg ${BASE}>
  <rect x="4" y="8" width="40" height="32" rx="3"/>
  <line x1="4" y1="17" x2="44" y2="17"/>
  <circle cx="11" cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
  <circle cx="18" cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
  <rect x="24" y="10" width="14" height="5" rx="2.5"/>
  <line x1="10" y1="24" x2="38" y2="24"/>
  <line x1="10" y1="30" x2="34" y2="30"/>
  <line x1="10" y1="36" x2="28" y2="36"/>
</svg>`;

export const ICON_SETTINGS = `<svg ${BASE}>
  <path d="M21.3,10.3 L20.2,4.4 L27.8,4.4 L26.7,10.3 L31.8,12.4 L35.2,7.4 L40.6,12.8 L35.6,16.2 L37.7,21.3 L43.6,20.2 L43.6,27.8 L37.7,26.7 L35.6,31.8 L40.6,35.2 L35.2,40.6 L31.8,35.6 L26.7,37.7 L27.8,43.6 L20.2,43.6 L21.3,37.7 L16.2,35.6 L12.8,40.6 L7.4,35.2 L12.4,31.8 L10.3,26.7 L4.4,27.8 L4.4,20.2 L10.3,21.3 L12.4,16.2 L7.4,12.8 L12.8,7.4 L16.2,12.4 Z"/>
  <circle cx="24" cy="24" r="7"/>
</svg>`;

export const ICON_STORE = `<svg ${BASE}>
  <path d="M14 20 L10 10 H38 L34 20"/>
  <rect x="8" y="20" width="32" height="22" rx="3"/>
  <path d="M20 20 Q20 29 24 29 Q28 29 28 20"/>
  <line x1="20" y1="34" x2="28" y2="34"/>
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

export const ICON_DARKMODE = `<svg ${BASE}>
  <path d="M30 10 Q20 14 20 24 Q20 34 30 38 Q18 40 12 32 Q6 24 10 14 Q16 4 30 10 Z"/>
</svg>`;
