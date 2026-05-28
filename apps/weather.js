import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import {
    ICON_WEATHER, ICON_BACK, ICON_SEARCH, ICON_REFRESH,
    ICON_SUN, ICON_CLOUD, ICON_RAIN, ICON_SNOW, ICON_STORM, ICON_WIND,
    ICON_NIGHT, ICON_PARTLY_CLOUDY,
} from '../icons/svg.js';

const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

AppRegistry.register({
    id: 'weather',
    name: 'Weather',
    icon: ICON_WEATHER,
    removable: false,
    render: renderWeather,
});

// ── WMO weather code → label / icon / background ──────────────
const WMO_CODE_MAP = {
    0:  { label: 'Clear Sky',      icon: ICON_SUN,           bg: 'linear-gradient(160deg,#1a6eff,#56b4ff)' },
    1:  { label: 'Mainly Clear',   icon: ICON_PARTLY_CLOUDY, bg: 'linear-gradient(160deg,#2176ae,#57c4e5)' },
    2:  { label: 'Partly Cloudy',  icon: ICON_PARTLY_CLOUDY, bg: 'linear-gradient(160deg,#3d6b8e,#8ab4c2)' },
    3:  { label: 'Overcast',       icon: ICON_CLOUD,         bg: 'linear-gradient(160deg,#5a6a75,#8ea7b8)' },
    45: { label: 'Foggy',          icon: ICON_CLOUD,         bg: 'linear-gradient(160deg,#6b7c8c,#a0b0bc)' },
    48: { label: 'Icy Fog',        icon: ICON_CLOUD,         bg: 'linear-gradient(160deg,#6b7c8c,#a0b0bc)' },
    51: { label: 'Light Drizzle',  icon: ICON_RAIN,          bg: 'linear-gradient(160deg,#3d5a73,#607d8b)' },
    53: { label: 'Drizzle',        icon: ICON_RAIN,          bg: 'linear-gradient(160deg,#3d5a73,#607d8b)' },
    55: { label: 'Heavy Drizzle',  icon: ICON_RAIN,          bg: 'linear-gradient(160deg,#2c4a62,#546a7b)' },
    61: { label: 'Light Rain',     icon: ICON_RAIN,          bg: 'linear-gradient(160deg,#2c4a62,#546a7b)' },
    63: { label: 'Rain',           icon: ICON_RAIN,          bg: 'linear-gradient(160deg,#1e3a4f,#3d5a70)' },
    65: { label: 'Heavy Rain',     icon: ICON_RAIN,          bg: 'linear-gradient(160deg,#152b3f,#2c4560)' },
    71: { label: 'Light Snow',     icon: ICON_SNOW,          bg: 'linear-gradient(160deg,#607d8b,#90a4ae)' },
    73: { label: 'Snow',           icon: ICON_SNOW,          bg: 'linear-gradient(160deg,#546e7a,#78909c)' },
    75: { label: 'Heavy Snow',     icon: ICON_SNOW,          bg: 'linear-gradient(160deg,#455a64,#607d8b)' },
    95: { label: 'Thunderstorm',   icon: ICON_STORM,         bg: 'linear-gradient(160deg,#1a1a2e,#16213e)' },
    96: { label: 'Thunderstorm',   icon: ICON_STORM,         bg: 'linear-gradient(160deg,#1a1a2e,#16213e)' },
    99: { label: 'Thunderstorm',   icon: ICON_STORM,         bg: 'linear-gradient(160deg,#1a1a2e,#16213e)' },
};

function getWeatherInfo(code) {
    return WMO_CODE_MAP[code] ?? { label: 'Unknown', icon: ICON_CLOUD, bg: 'linear-gradient(160deg,#607d8b,#90a4ae)' };
}

// ── Main render ───────────────────────────────────────────────
function renderWeather(container) {
    let searchPanelOpen = false;
    let tempUnit = Store.getOrDefault('weather-unit', 'C'); // 'C' or 'F'

    function toDisplayTemp(celsius) {
        return tempUnit === 'F' ? Math.round(celsius * 9 / 5 + 32) : Math.round(celsius);
    }

    function unitLabel() {
        return tempUnit === 'F' ? '°F' : '°C';
    }

    function toDisplayWind(kmh) {
        return tempUnit === 'F' ? Math.round(kmh * 0.621371) : Math.round(kmh);
    }

    function windLabel() {
        return tempUnit === 'F' ? 'mph' : 'km/h';
    }

    // ── Shell HTML (chrome + search panel + body slot) ────────
    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="weather-back">${ICON_BACK}</button>
            <span class="app-chrome-title">Weather</span>
            <div style="display:flex;gap:4px">
                <button class="app-chrome-btn" id="weather-refresh-btn" title="Refresh">${ICON_REFRESH}</button>
                <button class="app-chrome-btn" id="weather-search-btn" title="Change location">${ICON_SEARCH}</button>
            </div>
        </div>

        <div id="weather-search-panel" style="display:none;background:var(--bg-secondary);
            border-bottom:1px solid var(--border);padding:10px 12px">
            <div style="display:flex;gap:8px">
                <input class="pz-input" id="weather-location-input"
                    placeholder="City, zip code, or lat, lon…"
                    style="flex:1;font-size:14px" autocomplete="off" />
                <button class="pz-btn" id="weather-location-go"
                    style="padding:10px 16px">Go</button>
            </div>
            <div id="weather-search-results" style="margin-top:8px"></div>
            <button class="pz-btn secondary" id="weather-use-gps"
                style="width:100%;margin-top:8px;font-size:13px">
                Use My Location (GPS)
            </button>
        </div>

        <div class="app-body" id="weather-body" style="padding:0;overflow-y:auto">
            <div style="display:flex;align-items:center;justify-content:center;
                height:200px;color:var(--text-secondary);font-size:14px">
                Loading…
            </div>
        </div>
    `;

    // ── Chrome listeners ──────────────────────────────────────
    document.getElementById('weather-back').addEventListener('click', () => Router.home());

    document.getElementById('weather-search-btn').addEventListener('click', () => {
        searchPanelOpen = !searchPanelOpen;
        const panel = document.getElementById('weather-search-panel');
        panel.style.display = searchPanelOpen ? 'block' : 'none';
        if (searchPanelOpen) {
            document.getElementById('weather-location-input').focus();
        }
    });

    document.getElementById('weather-refresh-btn').addEventListener('click', () => {
        Store.remove('weather-cache');
        const savedLocation = Store.get('weather-location');
        if (savedLocation) {
            setBodyLoading('Refreshing…');
            fetchAndDisplay(savedLocation.lat, savedLocation.lon, savedLocation.name,
                tempUnit, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle);
        } else {
            fetchFromGeolocation(toDisplayTemp, unitLabel);
        }
    });

    document.getElementById('weather-location-go').addEventListener('click', () => {
        performLocationSearch(toDisplayTemp, unitLabel);
    });

    document.getElementById('weather-location-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performLocationSearch(toDisplayTemp, unitLabel);
    });

    document.getElementById('weather-use-gps').addEventListener('click', () => {
        Store.remove('weather-location');
        Store.remove('weather-cache');
        closeSearchPanel();
        fetchFromGeolocation(toDisplayTemp, unitLabel);
    });

    // ── Helper: toggle the search panel ──────────────────────
    function closeSearchPanel() {
        searchPanelOpen = false;
        const panel = document.getElementById('weather-search-panel');
        if (panel) panel.style.display = 'none';
    }

    // ── Helper: select a result and load its weather ──────────
    async function selectLocation(lat, lon, name) {
        Store.set('weather-location', { lat, lon, name });
        Store.remove('weather-cache');
        closeSearchPanel();
        setBodyLoading('Loading weather…');
        await fetchAndDisplay(lat, lon, name, tempUnit, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle);
    }

    // ── Location search (city / zip / raw coords) ─────────────
    async function performLocationSearch() {
        const query = document.getElementById('weather-location-input').value.trim();
        if (!query) return;

        const resultsEl = document.getElementById('weather-search-results');
        resultsEl.innerHTML = `<div style="font-size:13px;color:var(--text-muted);padding:4px 0">Searching…</div>`;

        // Detect raw coordinate input: "51.5, -0.12" or "51.5,-0.12"
        const coordPattern = /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/;
        const coordMatch = query.match(coordPattern);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lon = parseFloat(coordMatch[2]);
            const isValidLat = lat >= -90 && lat <= 90;
            const isValidLon = lon >= -180 && lon <= 180;

            if (isValidLat && isValidLon) {
                await selectLocation(lat, lon, `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                return;
            }
        }

        // Forward geocoding via open-meteo — handles city names and postal codes
        try {
            const searchResults = await searchLocationByName(query);

            if (searchResults.length === 0) {
                resultsEl.innerHTML = `<div style="font-size:13px;color:var(--text-muted);padding:4px 0">No locations found.</div>`;
                return;
            }

            resultsEl.innerHTML = searchResults.map((result, index) => {
                const subtitle = [result.admin1, result.country].filter(Boolean).join(', ');
                return `
                    <div class="weather-result-item" data-index="${index}"
                        style="padding:10px 12px;border-radius:8px;cursor:pointer;margin-bottom:4px;
                               background:var(--bg-tertiary);transition:opacity 0.1s">
                        <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${result.name}</div>
                        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${subtitle}</div>
                    </div>
                `;
            }).join('');

            resultsEl.querySelectorAll('.weather-result-item').forEach((item) => {
                item.addEventListener('click', async () => {
                    const chosenResult = searchResults[parseInt(item.dataset.index)];
                    const displayName = [chosenResult.name, chosenResult.admin1, chosenResult.country]
                        .filter(Boolean)
                        .join(', ');
                    await selectLocation(chosenResult.latitude, chosenResult.longitude, displayName);
                });
            });
        } catch {
            resultsEl.innerHTML = `<div style="font-size:13px;color:var(--danger);padding:4px 0">Search failed. Check your connection.</div>`;
        }
    }

    // ── Geolocation flow ──────────────────────────────────────
    function fetchFromGeolocation() {
        if (!navigator.geolocation) {
            showSearchPrompt('Your browser does not support GPS location.');
            return;
        }

        setBodyLoading('Fetching GPS location…');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const cityName = await reverseGeocode(latitude, longitude);
                    Store.set('weather-location', { lat: latitude, lon: longitude, name: cityName });
                    await fetchAndDisplay(latitude, longitude, cityName, tempUnit, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle);
                } catch {
                    showError('Could not load weather for your location.');
                }
            },
            () => showSearchPrompt('Location access denied. Search for a city above.'),
            { timeout: 10000 }
        );
    }

    // ── Initial load ──────────────────────────────────────────
    const savedLocation = Store.get('weather-location');

    if (savedLocation) {
        const cachedWeatherData = Store.get('weather-cache');
        if (cachedWeatherData) {
            // Render instantly from cache; TTL expiry is checked inside Store.get
            displayWeather(cachedWeatherData, savedLocation.name, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle);
        } else {
            setBodyLoading('Updating weather…');
            fetchAndDisplay(savedLocation.lat, savedLocation.lon, savedLocation.name,
                tempUnit, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle);
        }
    } else {
        fetchFromGeolocation();
    }

    // ── °C / °F toggle (called from within the weather display) ─
    function onUnitToggle() {
        tempUnit = tempUnit === 'C' ? 'F' : 'C';
        Store.set('weather-unit', tempUnit);

        const cachedWeatherData = Store.get('weather-cache');
        const location = Store.get('weather-location');
        if (cachedWeatherData && location) {
            displayWeather(cachedWeatherData, location.name, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle);
        }
    }

    // ── Body state helpers ────────────────────────────────────
    function setBodyLoading(message) {
        const body = document.getElementById('weather-body');
        if (body) {
            body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;
                    height:200px;color:var(--text-secondary);font-size:14px">${message}</div>
            `;
        }
    }

    function showSearchPrompt(message) {
        searchPanelOpen = true;
        const panel = document.getElementById('weather-search-panel');
        if (panel) panel.style.display = 'block';
        setBodyLoading(message);
    }

    function showError(message) {
        const body = document.getElementById('weather-body');
        if (body) {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;
                    justify-content:center;height:200px;gap:12px;padding:20px;text-align:center">
                    <div style="color:var(--danger);font-size:14px">${message}</div>
                    <button class="pz-btn secondary" id="weather-retry-btn" style="font-size:13px">
                        Try Again
                    </button>
                </div>
            `;
            document.getElementById('weather-retry-btn')?.addEventListener('click', () => {
                fetchFromGeolocation();
            });
        }
    }
}

// ── Data fetching ─────────────────────────────────────────────

async function fetchAndDisplay(lat, lon, cityName, tempUnit, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle) {
    try {
        const weatherData = await fetchWeatherData(lat, lon);
        Store.set('weather-cache', weatherData, { ttlMs: WEATHER_CACHE_TTL_MS });
        displayWeather(weatherData, cityName, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle);
    } catch {
        const body = document.getElementById('weather-body');
        if (body) {
            body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;
                    height:200px;color:var(--danger);font-size:14px">
                    Failed to fetch weather. Check your connection.
                </div>
            `;
        }
    }
}

/**
 * Search for locations by name or postal code using the open-meteo geocoding API.
 * Returns an array of result objects with { name, latitude, longitude, admin1, country }.
 */
async function searchLocationByName(query) {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=5&language=en&format=json`
    );
    if (!response.ok) throw new Error(`Geocoding request failed: ${response.status}`);
    const data = await response.json();
    return data.results ?? [];
}

/**
 * Convert coordinates to a city name using OpenStreetMap Nominatim.
 * Falls back to a formatted coordinate string if the API fails.
 */
async function reverseGeocode(lat, lon) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'Accept-Language': 'en' } }
    );
    if (!response.ok) return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    const data = await response.json();
    return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.display_name ||
        `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    );
}

/**
 * Fetch the full forecast payload from the open-meteo forecast API.
 */
async function fetchWeatherData(lat, lon) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&hourly=temperature_2m,weather_code,uv_index` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&forecast_days=6&timezone=auto`
    );
    if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
    return await response.json();
}

// ── Display ───────────────────────────────────────────────────

function displayWeather(data, cityName, toDisplayTemp, unitLabel, toDisplayWind, windLabel, onUnitToggle) {
    const body = document.getElementById('weather-body');
    if (!body) return;

    const current = data.current;
    const daily   = data.daily;
    const hourly  = data.hourly;
    const info    = getWeatherInfo(current.weather_code);

    // Show the next 12 hourly slots starting from the current hour
    const currentHour = new Date().getHours();
    const hourlyStartIndex = hourly.time.findIndex((timeString) => {
        return new Date(timeString + ':00').getHours() >= currentHour;
    });
    const hourlySliceStart = hourlyStartIndex >= 0 ? hourlyStartIndex : 0;

    const hourlyItems = hourly.time
        .slice(hourlySliceStart, hourlySliceStart + 12)
        .map((timeString, offset) => {
            const dataIndex = hourlySliceStart + offset;
            const displayTime = new Date(timeString + ':00')
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const hourInfo = getWeatherInfo(hourly.weather_code[dataIndex]);
            const displayTemp = toDisplayTemp(hourly.temperature_2m[dataIndex]);
            return `
                <div style="display:flex;flex-direction:column;align-items:center;
                    gap:6px;min-width:60px;padding:8px 4px">
                    <span style="font-size:12px;color:rgba(255,255,255,0.7)">${displayTime}</span>
                    <div style="width:24px;height:24px;color:#fff;opacity:0.9">${hourInfo.icon}</div>
                    <span style="font-size:14px;font-weight:500;color:#fff">${displayTemp}${unitLabel()}</span>
                </div>
            `;
        })
        .join('');

    const dailyItems = daily.time.slice(1).map((timeString, offset) => {
        const dataIndex = offset + 1;
        const dayName = new Date(timeString + 'T12:00:00')
            .toLocaleDateString([], { weekday: 'short' });
        const dayInfo = getWeatherInfo(daily.weather_code[dataIndex]);
        return `
            <div style="display:flex;align-items:center;justify-content:space-between;
                padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.1)">
                <span style="font-size:15px;color:rgba(255,255,255,0.9);width:50px">${dayName}</span>
                <div style="width:22px;height:22px;color:#fff;opacity:0.85">${dayInfo.icon}</div>
                <span style="font-size:15px;color:rgba(255,255,255,0.7)">
                    ${toDisplayTemp(daily.temperature_2m_min[dataIndex])}${unitLabel()}
                </span>
                <span style="font-size:15px;color:#fff;font-weight:600">
                    ${toDisplayTemp(daily.temperature_2m_max[dataIndex])}${unitLabel()}
                </span>
            </div>
        `;
    }).join('');

    body.style.background = info.bg;
    body.innerHTML = `
        <div style="padding-bottom:24px">

            <div style="padding:28px 24px 16px;text-align:center;color:#fff">
                <div style="font-size:17px;font-weight:500;opacity:0.85;margin-bottom:2px">${cityName}</div>
                <div style="width:80px;height:80px;margin:10px auto;color:#fff">${info.icon}</div>
                <div style="font-size:72px;font-weight:100;letter-spacing:-2px;line-height:1">
                    ${toDisplayTemp(current.temperature_2m)}${unitLabel()}
                </div>
                <div style="font-size:17px;opacity:0.8;margin-top:6px">${info.label}</div>
                <button id="weather-unit-toggle"
                    style="margin-top:12px;background:rgba(255,255,255,0.18);border:none;
                           color:#fff;padding:5px 14px;border-radius:20px;cursor:pointer;
                           font-size:13px;font-weight:600;letter-spacing:0.5px">
                    Switch to ${unitLabel() === '°C' ? 'Imperial (°F, mph)' : 'Metric (°C, km/h)'}
                </button>
            </div>

            <div style="display:flex;justify-content:space-around;padding:14px 24px;
                background:rgba(0,0,0,0.15);margin:0 16px;border-radius:12px">
                <div style="text-align:center;color:#fff">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px">HUMIDITY</div>
                    <div style="font-size:18px;font-weight:500">${current.relative_humidity_2m}%</div>
                </div>
                <div style="text-align:center;color:#fff">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px">WIND</div>
                    <div style="font-size:18px;font-weight:500">${toDisplayWind(current.wind_speed_10m)} ${windLabel()}</div>
                </div>
                <div style="text-align:center;color:#fff">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px">UV INDEX</div>
                    <div style="font-size:18px;font-weight:500">${Math.round(hourly.uv_index?.[hourlySliceStart] ?? 0)}</div>
                </div>
            </div>

            <div style="margin:16px;background:rgba(0,0,0,0.15);border-radius:12px;overflow:hidden">
                <div style="font-size:11px;color:rgba(255,255,255,0.6);padding:10px 16px;
                    letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1)">
                    HOURLY FORECAST
                </div>
                <div style="display:flex;overflow-x:auto;padding:8px 12px;gap:4px;scrollbar-width:none">
                    ${hourlyItems}
                </div>
            </div>

            <div style="margin:16px;background:rgba(0,0,0,0.15);border-radius:12px;overflow:hidden">
                <div style="font-size:11px;color:rgba(255,255,255,0.6);padding:10px 16px;
                    letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1)">
                    5-DAY FORECAST
                </div>
                ${dailyItems}
            </div>

        </div>
    `;

    // Wire the unit toggle — onUnitToggle is always provided from renderWeather
    document.getElementById('weather-unit-toggle')?.addEventListener('click', onUnitToggle);
}
