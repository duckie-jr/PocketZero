import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';

const ICON_HABITS = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <rect x="6" y="8" width="36" height="34" rx="6"/> <line x1="6" y1="18" x2="42" y2="18"/> <line x1="16" y1="4" x2="16" y2="12"/> <line x1="32" y1="4" x2="32" y2="12"/> <polyline points="16 28 22 34 34 24" stroke="white" stroke-width="3"/> </svg>`;

AppRegistry.register({
    id: 'habittracker',
    name: 'Habits',
    icon: ICON_HABITS,
    removable: true,
    render: renderHabitTracker,
});

function getTodayKey() {
    const now = new Date();
    return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
}

function getStreakForHabit(habitId, completions) {
    let streak = 0;
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
        const date = new Date(today);
        date.setDate(today.getDate() - dayOffset);
        const dateKey = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
        if (completions[dateKey]?.includes(habitId)) {
            streak++;
        } else if (dayOffset === 0) {
            // today not checked yet — don't break the streak
            continue;
        } else {
            break;
        }
    }
    return streak;
}

function renderHabitTracker(container) {
    const habitStore = Store.namespace('habits');

    function getHabits()       { return habitStore.getOrDefault('list', []); }
    function getCompletions()  { return habitStore.getOrDefault('completions', {}); }
    function saveHabits(list)  { habitStore.set('list', list); }

    function render() {
        const habits = getHabits();
        const completions = getCompletions();
        const todayKey = getTodayKey();
        const todayDone = completions[todayKey] ?? [];

        container.innerHTML = `
            <div class="app-chrome">
                <button class="app-chrome-btn" id="ht-back">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="app-chrome-title">Habits</span>
                <button class="app-chrome-btn" id="ht-add-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
            </div>
            <div style="flex:1;overflow:auto;padding:12px;background:var(--bg-primary)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <div style="font-size:13px;font-weight:600;color:var(--text-muted)">
                        ${new Date().toLocaleDateString([], { weekday:'long', month:'short', day:'numeric' }).toUpperCase()}
                    </div>
                    <div style="font-size:13px;font-weight:700;color:var(--accent)">
                        ${todayDone.length}/${habits.length} done
                    </div>
                </div>
                ${habits.length === 0
                    ? `<div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
                           <div style="font-size:36px;margin-bottom:8px">🌱</div>
                           <div style="font-size:14px">No habits yet. Tap + to add one.</div>
                       </div>`
                    : habits.map(habit => {
                        const isDone = todayDone.includes(habit.id);
                        const streak = getStreakForHabit(habit.id, completions);
                        return `
                            <div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
                                <button class="ht-check" data-id="${habit.id}"
                                    style="width:32px;height:32px;border-radius:50%;border:2.5px solid ${isDone ? '#22c55e' : 'var(--border)'};
                                           background:${isDone ? '#22c55e' : 'transparent'};flex-shrink:0;cursor:pointer;
                                           display:flex;align-items:center;justify-content:center;transition:all 0.2s">
                                    ${isDone ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                                </button>
                                <div style="flex:1;min-width:0">
                                    <div style="font-size:15px;font-weight:600;color:${isDone ? 'var(--text-muted)' : 'var(--text-primary)'};text-decoration:${isDone ? 'line-through' : 'none'}">
                                        ${habit.emoji} ${habit.name}
                                    </div>
                                    ${streak > 0
                                        ? `<div style="font-size:11px;color:#f59e0b;font-weight:600">🔥 ${streak} day streak</div>`
                                        : `<div style="font-size:11px;color:var(--text-muted)">Start today!</div>`}
                                </div>
                                <button class="ht-delete" data-id="${habit.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:20px;padding:4px 6px;line-height:1">×</button>
                            </div>`;
                    }).join('')
                }
            </div>
            <div id="ht-add-panel" style="display:none;padding:12px;background:var(--bg-secondary);border-top:1px solid var(--border)">
                <div style="display:flex;gap:8px;margin-bottom:8px">
                    <select id="ht-emoji" class="pz-input" style="width:60px;font-size:18px;text-align:center">
                        ${['✅','💪','📚','🏃','💧','🧘','🍎','🛌','✍️','🎯','🎸','🧹','🏋️','🌿','🎨'].map(e => '<option>' + e + '</option>').join('')}
                    </select>
                    <input id="ht-name" class="pz-input" placeholder="Habit name…" style="flex:1" maxlength="40"/>
                </div>
                <div style="display:flex;gap:8px">
                    <button class="pz-btn" id="ht-save" style="flex:1">Add Habit</button>
                    <button class="pz-btn secondary" id="ht-cancel" style="flex:1">Cancel</button>
                </div>
            </div>`;

        document.getElementById('ht-back').onclick = () => Router.home();

        document.getElementById('ht-add-btn').onclick = () => {
            const panel = document.getElementById('ht-add-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if (panel.style.display === 'block') document.getElementById('ht-name').focus();
        };

        document.getElementById('ht-cancel').onclick = () => {
            document.getElementById('ht-add-panel').style.display = 'none';
        };

        document.getElementById('ht-save').onclick = () => {
            const nameInput = document.getElementById('ht-name');
            const habitName = nameInput.value.trim();
            if (!habitName) return;
            const emoji = document.getElementById('ht-emoji').value;
            saveHabits([...getHabits(), { id: 'habit_' + Date.now(), name: habitName, emoji }]);
            render();
        };

        document.getElementById('ht-name')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('ht-save').click();
        });

        container.querySelectorAll('.ht-check').forEach(btn => {
            btn.onclick = () => {
                const habitId = btn.dataset.id;
                const currentCompletions = getCompletions();
                const todayList = currentCompletions[todayKey] ?? [];
                currentCompletions[todayKey] = todayList.includes(habitId)
                    ? todayList.filter(id => id !== habitId)
                    : [...todayList, habitId];
                habitStore.set('completions', currentCompletions);
                render();
            };
        });

        container.querySelectorAll('.ht-delete').forEach(btn => {
            btn.onclick = () => {
                saveHabits(getHabits().filter(h => h.id !== btn.dataset.id));
                render();
            };
        });
    }

    render();
}
