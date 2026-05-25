// Dialog — iOS-style modal overlay for alert / confirm / prompt
// Usage:
//   await Dialog.alert('Something happened')
//   const yes = await Dialog.confirm('Are you sure?')
//   const name = await Dialog.prompt('Enter your name', 'Default')

let overlayElement = null;

function getOverlay() {
    if (!overlayElement) {
        overlayElement = document.getElementById('dialog-overlay');
    }
    return overlayElement;
}

function showModal(htmlContent) {
    return new Promise((resolve) => {
        const overlay = getOverlay();
        overlay.innerHTML = htmlContent;
        overlay.style.display = 'flex';

        // Wire up all buttons to resolve with their data-value
        overlay.querySelectorAll('[data-dialog-action]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.dialogAction;
                const inputEl = overlay.querySelector('#dialog-input');
                const inputValue = inputEl ? inputEl.value : null;

                overlay.style.display = 'none';
                overlay.innerHTML = '';

                if (action === 'confirm') resolve(inputValue !== null ? inputValue : true);
                if (action === 'cancel')  resolve(inputValue !== null ? null : false);
            });
        });

        // Focus input if present
        const inputEl = overlay.querySelector('#dialog-input');
        if (inputEl) setTimeout(() => inputEl.focus(), 50);
    });
}

function buildCard(title, message, buttons, extraContent = '') {
    return `
        <div style="
            background: var(--bg-secondary);
            border-radius: 14px;
            width: min(320px, 90vw);
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(0,0,0,0.35);
            animation: dialogPop 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards;
        ">
            <div style="padding: 20px 20px 0; text-align: center;">
                ${title ? `<div style="font-size:17px;font-weight:600;color:var(--text-primary);margin-bottom:6px">${title}</div>` : ''}
                ${message ? `<div style="font-size:14px;color:var(--text-secondary);line-height:1.5">${message}</div>` : ''}
            </div>
            ${extraContent}
            <div style="display:flex;border-top:1px solid var(--border);margin-top:16px">
                ${buttons}
            </div>
        </div>
    `;
}

function buildButton(label, action, isPrimary = false) {
    return `
        <button data-dialog-action="${action}"
            style="flex:1;padding:14px 8px;font-size:17px;
                   font-weight:${isPrimary ? '600' : '400'};
                   color:${isPrimary ? 'var(--accent)' : 'var(--text-secondary)'};
                   background:none;border:none;cursor:pointer;
                   border-right:1px solid var(--border);
                   font-family:var(--font);
                   transition:background 0.1s"
            onmouseenter="this.style.background='var(--bg-tertiary)'"
            onmouseleave="this.style.background='none'">
            ${label}
        </button>
    `;
}

export const Dialog = {
    /**
     * Show a simple message with an OK button.
     * @param {string} message
     * @param {string} [title]
     * @returns {Promise<void>}
     */
    alert(message, title = '') {
        const buttons = buildButton('OK', 'confirm', true);
        return showModal(buildCard(title, message, buttons));
    },

    /**
     * Ask the user to confirm an action.
     * @param {string} message
     * @param {string} [title]
     * @param {string} [confirmLabel]
     * @param {string} [cancelLabel]
     * @returns {Promise<boolean>}
     */
    confirm(message, title = '', confirmLabel = 'OK', cancelLabel = 'Cancel') {
        const buttons =
            buildButton(cancelLabel,  'cancel',  false) +
            buildButton(confirmLabel, 'confirm', true);
        return showModal(buildCard(title, message, buttons));
    },

    /**
     * Ask the user to type a value.
     * @param {string} message
     * @param {string} [defaultValue]
     * @param {string} [title]
     * @param {string} [placeholder]
     * @returns {Promise<string|null>} — null if cancelled
     */
    prompt(message, defaultValue = '', title = '', placeholder = '') {
        const inputHtml = `
            <div style="padding: 12px 20px 0">
                <input id="dialog-input" class="pz-input"
                    value="${defaultValue.replace(/"/g, '&quot;')}"
                    placeholder="${placeholder.replace(/"/g, '&quot;')}"
                    style="font-size:15px"
                    autocomplete="off" />
            </div>
        `;
        const buttons =
            buildButton('Cancel', 'cancel',  false) +
            buildButton('OK',     'confirm', true);
        return showModal(buildCard(title, message, buttons, inputHtml));
    },
};
