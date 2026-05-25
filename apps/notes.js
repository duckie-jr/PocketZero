import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { Store } from './store.js';
import { Notify } from './notify.js';
import { ICON_NOTES, ICON_BACK, ICON_PLUS, ICON_TRASH, ICON_EDIT } from '../icons/svg.js';

AppRegistry.register({
    id: 'notes',
    name: 'Notes',
    icon: ICON_NOTES,
    removable: false,
    render: renderNotes,
});

function loadNotes() {
    return Store.get('notes') ?? [];
}

function saveNotes(notes) {
    Store.set('notes', notes);
}

function renderNotes(container) {
    let notes = loadNotes();
    let searchQuery = '';
    let editingNoteId = null;

    function showList() {
        editingNoteId = null;
        const filtered = notes.filter((note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.body.toLowerCase().includes(searchQuery.toLowerCase())
        );

        container.innerHTML = `
            <div class="app-chrome">
                <button class="app-chrome-btn" id="notes-back">${ICON_BACK}</button>
                <span class="app-chrome-title">Notes</span>
                <button class="app-chrome-btn" id="notes-add">${ICON_PLUS}</button>
            </div>
            <div style="padding:10px 16px 0;background:var(--bg-secondary);border-bottom:1px solid var(--border)">
                <input class="pz-input" id="notes-search" placeholder="Search notes..." value="${searchQuery}" />
            </div>
            <div class="app-body" style="gap:8px">
                ${filtered.length === 0
                    ? `<div class="empty-state">${ICON_NOTES}<span>${searchQuery ? 'No results' : 'No notes yet. Tap + to create one.'}</span></div>`
                    : filtered.map((note) => `
                        <div class="card note-item" data-id="${note.id}" style="cursor:pointer;display:flex;gap:12px;align-items:flex-start">
                            <div style="flex:1;overflow:hidden">
                                <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(note.title || 'Untitled')}</div>
                                <div style="font-size:13px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(note.body.slice(0, 80))}</div>
                                <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${new Date(note.updatedAt).toLocaleDateString()}</div>
                            </div>
                            <button class="app-chrome-btn note-delete" data-id="${note.id}">${ICON_TRASH}</button>
                        </div>
                    `).join('')
                }
            </div>
        `;

        document.getElementById('notes-back').addEventListener('click', () => Router.home());
        document.getElementById('notes-add').addEventListener('click', () => showEditor(null));
        document.getElementById('notes-search').addEventListener('input', (e) => {
            searchQuery = e.target.value;
            showList();
        });

        container.querySelectorAll('.note-item').forEach((item) => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.note-delete')) return;
                const noteId = item.dataset.id;
                const note = notes.find((n) => n.id === noteId);
                if (note) showEditor(note);
            });
        });

        container.querySelectorAll('.note-delete').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                notes = notes.filter((n) => n.id !== btn.dataset.id);
                saveNotes(notes);
                Notify.show('Note deleted');
                showList();
            });
        });
    }

    function showEditor(existingNote) {
        const isNew = existingNote === null;
        const noteId = existingNote?.id ?? crypto.randomUUID();
        editingNoteId = noteId;

        container.innerHTML = `
            <div class="app-chrome">
                <button class="app-chrome-btn" id="editor-back">${ICON_BACK}</button>
                <span class="app-chrome-title">${isNew ? 'New Note' : 'Edit Note'}</span>
                <button class="pz-btn" id="editor-save" style="font-size:13px;padding:4px 12px">Save</button>
            </div>
            <div style="display:flex;flex-direction:column;flex:1;padding:16px;gap:10px;overflow-y:auto">
                <input class="pz-input" id="note-title" placeholder="Title" style="font-size:18px;font-weight:600" value="${escapeHtml(existingNote?.title ?? '')}" />
                <textarea class="pz-input" id="note-body" placeholder="Start writing..." style="flex:1;resize:none;min-height:300px;line-height:1.6">${escapeHtml(existingNote?.body ?? '')}</textarea>
            </div>
        `;

        document.getElementById('editor-back').addEventListener('click', showList);
        document.getElementById('editor-save').addEventListener('click', () => {
            const title = document.getElementById('note-title').value.trim();
            const body = document.getElementById('note-body').value;
            const now = Date.now();

            if (isNew) {
                notes.unshift({ id: noteId, title, body, createdAt: now, updatedAt: now });
            } else {
                const index = notes.findIndex((n) => n.id === noteId);
                if (index !== -1) notes[index] = { ...notes[index], title, body, updatedAt: now };
            }

            saveNotes(notes);
            Notify.show('Note saved');
            showList();
        });

        document.getElementById('note-title').focus();
    }

    showList();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
