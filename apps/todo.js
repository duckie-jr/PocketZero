import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { ICON_TODO, ICON_BACK, ICON_PLUS, ICON_TRASH, ICON_CHECK } from '../icons/svg.js';

AppRegistry.register({
    id: 'todo',
    name: 'To-Do',
    icon: ICON_TODO,
    removable: false,
    render: renderTodo,
});

function loadTasks() { return Store.get('tasks') ?? []; }
function saveTasks(tasks) { Store.set('tasks', tasks); }

function renderTodo(container) {
    let tasks = loadTasks();
    let activeFilter = 'all';

    function getFiltered() {
        if (activeFilter === 'active') return tasks.filter((t) => !t.done);
        if (activeFilter === 'done') return tasks.filter((t) => t.done);
        return tasks;
    }

    function render() {
        const filtered = getFiltered();
        container.innerHTML = `
            <div class="app-chrome">
                <button class="app-chrome-btn" id="todo-back">${ICON_BACK}</button>
                <span class="app-chrome-title">To-Do</span>
                <span style="width:36px"></span>
            </div>
            <div style="padding:12px 16px;background:var(--bg-secondary);border-bottom:1px solid var(--border);display:flex;gap:8px">
                <input class="pz-input" id="todo-input" placeholder="Add a task..." style="flex:1" />
                <button class="pz-btn" id="todo-add" style="padding:10px 14px">${ICON_PLUS}</button>
            </div>
            <div class="tab-bar">
                <button class="tab-bar-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${tasks.length})</button>
                <button class="tab-bar-btn ${activeFilter === 'active' ? 'active' : ''}" data-filter="active">Active (${tasks.filter((t) => !t.done).length})</button>
                <button class="tab-bar-btn ${activeFilter === 'done' ? 'active' : ''}" data-filter="done">Done (${tasks.filter((t) => t.done).length})</button>
            </div>
            <div class="app-body" style="gap:6px">
                ${filtered.length === 0
                    ? `<div class="empty-state">${ICON_TODO}<span>No tasks here</span></div>`
                    : filtered.map((task) => `
                        <div class="card task-item" data-id="${task.id}" style="display:flex;align-items:center;gap:12px;cursor:pointer">
                            <button class="task-check" data-id="${task.id}" style="width:24px;height:24px;border-radius:50%;border:2px solid ${task.done ? 'var(--accent)' : 'var(--border)'};background:${task.done ? 'var(--accent)' : 'transparent'};display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all 0.15s">
                                ${task.done ? `<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" width="14" height="14"><polyline points="10,24 19,33 38,14"/></svg>` : ''}
                            </button>
                            <span style="flex:1;font-size:15px;color:var(--text-primary);text-decoration:${task.done ? 'line-through' : 'none'};opacity:${task.done ? '0.5' : '1'}">${escapeHtml(task.text)}</span>
                            <button class="task-delete" data-id="${task.id}" style="opacity:0.4;transition:opacity 0.15s">${ICON_TRASH}</button>
                        </div>
                    `).join('')}
            </div>
        `;

        document.getElementById('todo-back').addEventListener('click', () => Router.home());

        document.getElementById('todo-add').addEventListener('click', addTask);
        document.getElementById('todo-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addTask();
        });

        container.querySelectorAll('.tab-bar-btn').forEach((btn) => {
            btn.addEventListener('click', () => { activeFilter = btn.dataset.filter; render(); });
        });

        container.querySelectorAll('.task-check').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskIndex = tasks.findIndex((t) => t.id === btn.dataset.id);
                if (taskIndex !== -1) {
                    tasks[taskIndex].done = !tasks[taskIndex].done;
                    saveTasks(tasks);
                    render();
                }
            });
        });

        container.querySelectorAll('.task-delete').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                tasks = tasks.filter((t) => t.id !== btn.dataset.id);
                saveTasks(tasks);
                render();
            });
        });
    }

    function addTask() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        if (!text) return;
        tasks.unshift({ id: crypto.randomUUID(), text, done: false, createdAt: Date.now() });
        saveTasks(tasks);
        input.value = '';
        Notify.show('Task added');
        render();
    }

    render();
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
