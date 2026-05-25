import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { ICON_WEATHER, ICON_BACK, ICON_SUN, ICON_CLOUD, ICON_RAIN, ICON_SNOW, ICON_STORM, ICON_WIND, ICON_NIGHT, ICON_PARTLY_CLOUDY } from '../icons/svg.js';

AppRegistry.register({
    id: 'weather',
    name: 'Weather',
    icon: ICON_WEATHER,
    removable: false,
    render: renderWeather,
});

const WMO_CODE_MAP = {
    0: { label: 'Clear Sky', icon: ICON_SUN, bg: 'linear-gradient(160deg,#1a6eff,#56b4ff)' },
    1: { label: 'Mainly Clear', icon: ICON_PARTLY_CLOUDY, bg: 'linear-gradient(160deg,#2176ae,#57c4e5)' },
    2: { label: 'Partly Cloudy', icon: ICON_PARTLY_CLOUDY, bg: 'linear-gradient(160deg,#3d6b8e,#8ab4c2)' },
    3: { label: 'Overcast', icon: ICON_CLOUD, bg: 'linear-gradient(160deg,#5a6a75,#8ea7b8)' },
    45: { label: 'Foggy', icon: ICON_CLOUD, bg: 'linear-gradient(160deg,#6b7c8c,#a0b0bc)' },
    48: { label: 'Icy Fog', icon: ICON_CLOUD, bg: 'linear-gradient(160deg,#6b7c8c,#a0b0bc)' },
    51: { label: 'Light Drizzle', icon: ICON_RAIN, bg: 'linear-gradient(160deg,#3d5a73,#607d8b)' },
    53: { label: 'Drizzle', icon: ICON_RAIN, bg: 'linear-gradient(160deg,#3d5a73,#607d8b)' },
    55: { label: 'Heavy Drizzle', icon: ICON_RAIN, bg: 'linear-gradient(160deg,#2c4a62,#546a7b)' },
    61: { label: 'Light Rain', icon: ICON_RAIN, bg: 'linear-gradient(160deg,#2c4a62,#546a7b)' },
    63: { label: 'Rain', icon: ICON_RAIN, bg: 'linear-gradient(160deg,#1e3a4f,#3d5a70)' },
    65: { label: 'Heavy Rain', icon: ICON_RAIN, bg: 'linear-gradient(160deg,#152b3f,#2c4560)' },
    71: { label: 'Light Snow', icon: ICON_SNOW, bg: 'linear-gradient(160deg,#607d8b,#90a4ae)' },
    73: { label: 'Snow', icon: ICON_SNOW, bg: 'linear-gradient(160deg,#546e7a,#78909c)' },
    75: { label: 'Heavy Snow', icon: ICON_SNOW, bg: 'linear-gradient(160deg,#455a64,#607d8b)' },
    95: { label: 'Thunderstorm', icon: ICON_STORM, bg: 'linear-gradient(160deg,#1a1a2e,#16213e)' },
    96: { label: 'Thunderstorm', icon: ICON_STORM, bg: 'linear-gradient(160deg,#1a1a2e,#16213e)' },
    99: { label: 'Thunderstorm', icon: ICON_STORM, bg: 'linear-gradient(160deg,#1a1a2e,#16213e)' },
};

function getWeatherInfo(code) {
    return WMO_CODE_MAP[code] ?? { label: 'Unknown', icon: ICON_CLOUD, bg: 'linear-gradient(160deg,#607d8b,#90a4ae)' };
}

function renderWeather(container) {
    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="weather-back">${ICON_BACK}</button>
            <span class="app-chrome-title">Weather</span>
            <span style="width:36px"></span>
        </div>
        <div class="app-body" id="weather-body" style="padding:0;overflow-y:auto">
            <div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--text-secondary);font-size:14px">
                Fetching location...
            </div>
        </div>
    `;

    document.getElementById('weather-back').addEventListener('click', () => Router.home());

    const cachedData = Store.get('weather-data');
    const cachedCity = Store.get('weather-city');
    if (cachedData && cachedCity) {
        displayWeather(cachedData, cachedCity);
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const cityName = await fetchCityName(latitude, longitude);
                    const weatherData = await fetchWeatherData(latitude, longitude);
                    Store.set('weather-data', weatherData);
                    Store.set('weather-city', cityName);
                    displayWeather(weatherData, cityName);
                } catch (error) {
                    document.getElementById('weather-body').innerHTML =
                        `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--danger);font-size:14px">Failed to load weather</div>`;
                }
            },
            () => {
                if (!cachedData) {
                    document.getElementById('weather-body').innerHTML =
                        `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--text-secondary);font-size:14px;text-align:center;padding:20px">Location access denied.<br>Enable location to see weather.</div>`;
                }
            }
        );
    }
}

async function fetchCityName(lat, lon) {
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`
    );
    const data = await response.json();
    return data.results?.[0]?.name ?? 'Unknown Location';
}

async function fetchWeatherData(lat, lon) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index` +
        `&hourly=temperature_2m,weather_code` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&forecast_days=6&timezone=auto`
    );
    return await response.json();
}

function displayWeather(data, cityName) {
    const body = document.getElementById('weather-body');
    if (!body) return;

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;
    const info = getWeatherInfo(current.weather_code);
    const tempUnit = '\u00b0C';

    const hourlyItems = [...Array(12)].map((_, i) => {
        const time = new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const hourInfo = getWeatherInfo(hourly.weather_code[i]);
        return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:60px;padding:8px 0">
                <span style="font-size:12px;color:rgba(255,255,255,0.7)">${time}</span>
                <div style="width:24px;height:24px;color:#fff;opacity:0.9">${hourInfo.icon}</div>
                <span style="font-size:14px;font-weight:500;color:#fff">${Math.round(hourly.temperature_2m[i])}${tempUnit}</span>
            </div>
        `;
    }).join('');

    const dailyItems = daily.time.slice(1).map((time, i) => {
        const dayIndex = i + 1;
        const dayName = new Date(time).toLocaleDateString([], { weekday: 'short' });
        const dayInfo = getWeatherInfo(daily.weather_code[dayIndex]);
        return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.1)">
                <span style="font-size:15px;color:rgba(255,255,255,0.9);width:50px">${dayName}</span>
                <div style="width:22px;height:22px;color:#fff;opacity:0.85">${dayInfo.icon}</div>
                <span style="font-size:15px;color:rgba(255,255,255,0.7)">${Math.round(daily.temperature_2m_min[dayIndex])}${tempUnit}</span>
                <span style="font-size:15px;color:#fff;font-weight:600">${Math.round(daily.temperature_2m_max[dayIndex])}${tempUnit}</span>
            </div>
        `;
    }).join('');

    body.innerHTML = `
        <div style="background:${info.bg};min-height:100%;padding-bottom:24px">
            <div style="padding:32px 24px 20px;text-align:center;color:#fff">
                <div style="font-size:18px;font-weight:500;opacity:0.85;margin-bottom:4px">${cityName}</div>
                <div style="width:80px;height:80px;margin:12px auto;color:#fff">${info.icon}</div>
                <div style="font-size:72px;font-weight:100;letter-spacing:-2px;line-height:1">${Math.round(current.temperature_2m)}${tempUnit}</div>
                <div style="font-size:18px;opacity:0.8;margin-top:8px">${info.label}</div>
            </div>

            <div style="display:flex;justify-content:space-around;padding:16px 24px;background:rgba(0,0,0,0.15);margin:0 16px;border-radius:12px">
                <div style="text-align:center;color:#fff">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px">HUMIDITY</div>
                    <div style="font-size:18px;font-weight:500">${current.relative_humidity_2m}%</div>
                </div>
                <div style="text-align:center;color:#fff">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px">WIND</div>
                    <div style="font-size:18px;font-weight:500">${Math.round(current.wind_speed_10m)} km/h</div>
                </div>
                <div style="text-align:center;color:#fff">
                    <div style="font-size:11px;opacity:0.7;margin-bottom:4px">UV INDEX</div>
                    <div style="font-size:18px;font-weight:500">${Math.round(current.uv_index ?? 0)}</div>
                </div>
            </div>

            <div style="margin:16px;background:rgba(0,0,0,0.15);border-radius:12px;overflow:hidden">
                <div style="font-size:11px;color:rgba(255,255,255,0.6);padding:10px 16px;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1)">HOURLY FORECAST</div>
                <div style="display:flex;overflow-x:auto;padding:8px 12px;gap:4px;scrollbar-width:none">${hourlyItems}</div>
            </div>

            <div style="margin:16px;background:rgba(0,0,0,0.15);border-radius:12px;overflow:hidden">
                <div style="font-size:11px;color:rgba(255,255,255,0.6);padding:10px 16px;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.1)">5-DAY FORECAST</div>
                ${dailyItems}
            </div>
        </div>
    `;
}
