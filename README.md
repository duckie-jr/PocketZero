# PocketZero

> A lightweight, iOS-inspired web OS shell — built with vanilla HTML, CSS, and JavaScript. No frameworks. No runtime dependencies.

---

## ✨ Features

| Category | Details |
|---|---|
| 🏠 Home screen | App grid with icon badges, 4- or 5-column layout |
| 🔒 Lock screen | Clock + swipe-to-unlock |
| 🌗 Theming | Light / Dark / System — CSS custom properties |
| 🔔 Notifications | Top-banner toasts |
| 🗂️ Multi-app routing | Zoom-in/out transitions, back stack |
| 💾 Persistence | `localStorage` via the Store API |
| 🔊 Sound | Web Audio tones — respects global mute |
| 🌐 HTTP | Fetch wrapper with JSON parsing and timeout |
| 📦 Plugin-ready | Drop a file in `apps/` and it's on the home screen |

---

## 🚀 Quick Start

```bash
npx vite
# then open http://localhost:5173
```

Or serve `index.html` with any static file server — no build step required.

---

## 📱 Built-in Apps

| App | ID | Description |
|---|---|---|
| Clock | `clock` | Live digital clock |
| Calculator | `calculator` | Standard arithmetic |
| Notes | `notes` | Persistent text notes |
| To-Do | `todo` | Task list with badges |
| Calendar | `calendar` | Monthly calendar view |
| Weather | `weather` | Current conditions via Open-Meteo |
| Music | `music` | Playback controls UI |
| Browser | `browser` | In-shell web browser |
| Settings | `settings` | Theme, grid, sound, mute |
| Play Store | `playstore` | Install community apps |
| Snake | `snake` | Classic arcade game |

---

## 🔌 Adding a New App

Two steps:

1. Create `apps/yourapp.js` and register it:

```js
// apps/yourapp.js
AppRegistry.register({
  id: 'yourapp',
  name: 'My App',
  icon: '<svg>…</svg>',          // any inline SVG
  removable: false,              // true = user can uninstall
  render(container) {
    container.innerHTML = '<h1>Hello!</h1>';
  }
});
```

2. Import it in `apps/index.js`:

```js
import './yourapp.js';
```

The icon appears on the home screen automatically — no other wiring needed.

---

## 🧩 Full API Reference

Every API is available as an ES module import for built-in apps, or via `window.PocketZero` for installed/store apps.

---

### `AppRegistry` — app lifecycle

```js
AppRegistry.register({ id, name, icon, render, removable })
AppRegistry.getAll()       // → App[]
AppRegistry.getById(id)    // → App | null
AppRegistry.remove(id)     // removes a removable app
```

---

### `Router` — navigation

```js
Router.open(appId)     // open app (zoom-in animation)
Router.back()          // go to previous screen
Router.home()          // close app → home screen
Router.getCurrent()    // → appId | null
```

---

### `Store` — localStorage wrapper

```js
Store.get(key)           // → parsed value | null
Store.set(key, value)    // JSON-serialises and saves
Store.remove(key)        // delete one key
Store.clear()            // wipe all PocketZero data
```

---

### `Notify` — top-banner toast

```js
Notify.show(message)                  // auto-dismiss after 3 s
Notify.show(message, durationMs)      // custom duration
```

---

### `Dialog` — iOS-style modals *(async/await)*

```js
// Alert
await Dialog.alert('Something happened')
await Dialog.alert('Message', 'Title')

// Confirm — returns boolean
const ok = await Dialog.confirm('Delete this?')
const ok = await Dialog.confirm('Sure?', 'Confirm', 'Yes', 'No')

// Prompt — returns string | null (null = cancelled)
const name = await Dialog.prompt('Enter name')
const name = await Dialog.prompt('Enter name', 'Default', 'Title', 'Placeholder…')
```

---

### `EventBus` — pub/sub messaging

```js
EventBus.on('task:added', handler)       // subscribe
EventBus.once('app:opened', handler)     // subscribe once
EventBus.off('task:added', handler)      // unsubscribe
EventBus.emit('task:added', payload)     // publish
EventBus.clear('task:added')             // remove all listeners for event
EventBus.clear()                         // remove every listener
```

**System events emitted by the shell:**

| Event | Payload | When |
|---|---|---|
| `theme:changed` | `'light'` \| `'dark'` | User changes theme in Settings |

---

### `Badge` — home screen icon bubbles

```js
Badge.set('todo', 3)      // show red bubble with "3"
Badge.set('todo', 0)      // remove badge
Badge.get('todo')         // → number
Badge.increment('todo')   // count + 1
Badge.decrement('todo')   // count − 1  (floor 0)
Badge.clear()             // remove all badges
Badge.refresh()           // re-render after home screen rebuild
```

---

### `Sound` — Web Audio tones

All sounds silently no-op when the global mute toggle is on.

```js
Sound.click()                    // soft UI tick
Sound.beep()                     // simple beep
Sound.tone(440, 0.3)             // freq Hz, duration s
Sound.tone(440, 0.3, 0.5)        // + gain (0–1)
Sound.chord([261, 329, 392])     // play notes simultaneously
Sound.success()                  // rising 3-note chime
Sound.error()                    // low buzz
Sound.notify()                   // soft ping
Sound.alarm(3)                   // repeating alarm, N times
```

---

### `Http` — fetch wrapper

```js
// GET
const data = await Http.get('https://api.example.com/data')
const data = await Http.get(url, { timeout: 5000 })   // ms

// POST / PUT / DELETE
const result = await Http.post(url, { key: 'value' })
const result = await Http.put(url, body)
const result = await Http.delete(url)

// Raw response { data, status, ok }
const { data, status, ok } = await Http.request(url, fetchOptions)
```

Responses are automatically JSON-parsed when the `Content-Type` is `application/json`; otherwise raw text is returned.

---

## 🗂️ File Structure

```
index.html            ← single HTML shell
style.css             ← global styles + CSS variables
main.js               ← boots shell, exposes window.PocketZero
manifest.json         ← PWA manifest

icons/
  svg.js              ← all SVG strings as named exports

apps/
  index.js            ← only file to edit when adding an app ✏️
  registry.js         ← AppRegistry
  router.js           ← Router
  store.js            ← Store
  notify.js           ← Notify
  dialog.js           ← Dialog
  eventbus.js         ← EventBus
  badge.js            ← Badge
  sound.js            ← Sound
  http.js             ← Http
  clock.js
  calculator.js
  notes.js
  todo.js
  calendar.js
  weather.js
  music.js
  browser.js
  settings.js
  playstore.js
  store-catalog.js
  games/
    snake.js
```

---

## 🛠️ Tech Stack

- **Vanilla HTML / CSS / JS** — zero runtime dependencies
- **Vite** — dev server + HMR only (no bundling required for production)
- **localStorage** — all app data persisted client-side
- **Web Audio API** — sound synthesis, no audio files
- **[Open-Meteo](https://open-meteo.com/)** — free weather API, no key needed
- **CSS custom properties** — light/dark theming throughout

> Portrait phone layout shows a "rotate your device" screen. Desktop and landscape mobile are fully supported.
