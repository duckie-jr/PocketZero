import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { ICON_CALENDAR, ICON_BACK, ICON_PLUS, ICON_TRASH } from '../icons/svg.js';

AppRegistry.register({
    id: 'calendar',
    name: 'Calendar',
    icon: ICON_CALENDAR,
    removable: false,
    render: renderCalendar,
});

function loadEvents() { return Store.get('calendar-events') ?? {}; }
function saveEvents(events) { Store.set('calendar-events', events); }

function renderCalendar(container) {
    const today = new Date();
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDateKey = null;
    let events = loadEvents();

    function dateKey(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function render() {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const startDayOfWeek = firstDay.getDay();
        const monthLabel = firstDay.toLocaleDateString([], { month: 'long', year: 'numeric' });
        const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        const dayCells = [...Array(startDayOfWeek).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

        while (dayCells.length % 7 !== 0) dayCells.push(null);

        const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
        const selectedEvents = selectedDateKey ? (events[selectedDateKey] ?? []) : [];

        container.innerHTML = `
            <div class="app-chrome">
                <button class="app-chrome-btn" id="cal-back">${ICON_BACK}</button>
                <span class="app-chrome-title">Calendar</span>
                <span style="width:36px"></span>
            </div>
            <div class="app-body" style="gap:12px">
                <div class="card" style="padding:12px">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                        <button class="pz-btn secondary" id="cal-prev" style="padding:6px 14px">&#8249;</button>
                        <span style="font-size:16px;font-weight:600;color:var(--text-primary)">${monthLabel}</span>
                        <button class="pz-btn secondary" id="cal-next" style="padding:6px 14px">&#8250;</button>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">
                        ${DAY_LABELS.map((d) => `<div style="font-size:11px;font-weight:600;color:var(--text-muted);padding:4px 0">${d}</div>`).join('')}
                        ${dayCells.map((day) => {
                            if (!day) return '<div></div>';
                            const key = dateKey(viewYear, viewMonth, day);
                            const isToday = key === todayKey;
                            const isSelected = key === selectedDateKey;
                            const hasEvents = (events[key] ?? []).length > 0;
                            const bg = isSelected ? 'var(--accent)' : isToday ? 'var(--bg-tertiary)' : 'transparent';
                            const color = isSelected ? '#fff' : isToday ? 'var(--accent)' : 'var(--text-primary)';
                            const fontWeight = isToday ? '700' : '400';
                            return `
                                <div class="cal-day" data-key="${key}" style="padding:6px 2px;border-radius:8px;cursor:pointer;background:${bg};color:${color};font-weight:${fontWeight};font-size:14px;position:relative;transition:background 0.15s">
                                    ${day}
                                    ${hasEvents ? `<div style="width:4px;height:4px;border-radius:50%;background:${isSelected ? '#fff' : 'var(--accent)'};margin:1px auto 0"></div>` : '<div style="height:5px"></div>'}
                                </div>`;
                        }).join('')}
                    </div>
                </div>

                ${selectedDateKey ? `
                <div class="card">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                        <span style="font-size:14px;font-weight:600;color:var(--text-primary)">${new Date(selectedDateKey + 'T00:00:00').toLocaleDateString([], { weekday:'long', month:'long', day:'numeric' })}</span>
                        <button class="pz-btn" id="cal-add-event" style="padding:6px 12px;font-size:12px">${ICON_PLUS} Add</button>
                    </div>
                    <div id="cal-event-list" style="display:flex;flex-direction:column;gap:6px">
                        ${selectedEvents.length === 0
                            ? `<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:8px">No events</div>`
                            : selectedEvents.map((evt, i) => `
                                <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-tertiary);border-radius:8px">
                                    <div style="flex:1">
                                        <div style="font-size:14px;font-weight:500;color:var(--text-primary)">${escapeHtml(evt.title)}</div>
                                        ${evt.time ? `<div style="font-size:12px;color:var(--text-muted)">${escapeHtml(evt.time)}</div>` : ''}
                                    </div>
                                    <button class="cal-delete-event" data-index="${i}" style="opacity:0.5;background:none;border:none;cursor:pointer;color:var(--text-primary)">${ICON_TRASH}</button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>` : `<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:8px">Tap a day to see events</div>`}
            </div>
        `;

        document.getElementById('cal-back').addEventListener('click', () => Router.home());
        document.getElementById('cal-prev').addEventListener('click', () => {
            viewMonth--;
            if (viewMonth < 0) { viewMonth = 11; viewYear--; }
            render();
        });
        document.getElementById('cal-next').addEventListener('click', () => {
            viewMonth++;
            if (viewMonth > 11) { viewMonth = 0; viewYear++; }
            render();
        });

        container.querySelectorAll('.cal-day').forEach((cell) => {
            cell.addEventListener('click', () => {
                selectedDateKey = cell.dataset.key;
                render();
            });
        });

        if (selectedDateKey) {
            document.getElementById('cal-add-event').addEventListener('click', () => {
                const title = prompt('Event title:');
                if (!title?.trim()) return;
                const time = prompt('Time (optional, e.g. 3:00 PM):') ?? '';
                if (!events[selectedDateKey]) events[selectedDateKey] = [];
                events[selectedDateKey].push({ title: title.trim(), time: time.trim() });
                saveEvents(events);
                Notify.show('Event added');
                render();
            });

            container.querySelectorAll('.cal-delete-event').forEach((btn) => {
                btn.addEventListener('click', () => {
                    events[selectedDateKey].splice(parseInt(btn.dataset.index), 1);
                    if (events[selectedDateKey].length === 0) delete events[selectedDateKey];
                    saveEvents(events);
                    render();
                });
            });
        }
    }

    render();
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
