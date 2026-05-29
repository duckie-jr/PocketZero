# PocketZero


A web OS shell that runs in the browser. Looks and feels like a phone OS — lock screen, home screen, apps, control center. Built with vanilla HTML, CSS, and JS, no frameworks.

**Live:** [duckie-jr.github.io/PocketZero](https://duckie-jr.github.io/PocketZero/)

Designed for landscape on phones and desktops. Portrait shows a rotate prompt.

---

## Installing on your phone

Open the link in Chrome on Android → tap ⋮ → **Install app**. Works offline once installed.

---

## Apps

### Clock
Four tabs: **Clock** (analog + digital), **Stopwatch**, **Timer** (countdown with alert), **Pomodoro** (work/break cycle).

### Calculator
Standard and scientific mode. Scientific adds sin, cos, tan, sqrt, log, ln, π, e, x², x³, 1/x. Calculation history is saved.

### Notes
Create, edit, delete notes. Search filters title and body in real time. Saved to localStorage.

### To-Do
Add, check off, and delete tasks. Filters: All / Active / Done. Badge on the home screen icon shows active task count.

### Calendar
Monthly view. Tap any day to add or delete events. Persists across sessions.

### Weather
Uses device GPS + [Open-Meteo](https://open-meteo.com/) — free, no API key. Shows temperature, wind speed, and condition. Caches last result.

### Music
Load audio files from your device. Playlist with play, pause, next, previous, shuffle. Live audio visualizer. No streaming — plays files you load yourself.

### Browser
iframe browser with a URL bar (falls back to Google search). Back/forward history, refresh, bookmarks on the new tab screen.

### Settings
Theme (Light/Dark/System), font size, grid columns (4 or 5), sound toggle, wallpaper presets (Midnight, Ocean, Forest, Dusk, Ember, Slate, Sand, Minimal).

### Store
Browse and install community apps. Paste custom JS to sideload your own app. Manage tab lets you remove installed apps.

### Snake
Classic snake on a 20×16 grid. On-screen D-pad or arrow keys. High score saved.

---

## Building your own app

### 1. Create the app file

Create `apps/yourapp.js`. Every app calls `AppRegistry.register()` with at minimum an `id`, `name`, `icon`, and `render` function:

```js
import { AppRegistry } from './registry.js';
import { Router } from './router.js';

AppRegistry.register({
  id: 'yourapp',         // unique, no spaces
  name: 'My App',        // shown on home screen
  icon: '<svg>…</svg>',  // inline SVG string
  removable: false,      // true = user can uninstall from Store
  render(container) {
    // container is the #app-window div — write whatever HTML you want into it
    container.innerHTML = `
      <div class="app-chrome">
        <button class="app-chrome-btn" id="back-btn">←</button>
        <span class="app-chrome-title">My App</span>
      </div>
      <div class="app-body">
        <p>Hello world</p>
      </div>
    `;
    document.getElementById('back-btn').addEventListener('click', () => Router.home());
  }
});
```

### 2. Register it

Add one import line to `apps/index.js`:

```js
import './yourapp.js';
```

The icon appears on the home screen automatically — no other wiring needed.

### CSS classes you can use

These are already defined in `style.css`:

| Class | What it is |
|---|---|
| `app-chrome` | top bar with back button + title |
| `app-chrome-btn` | icon button in the top bar |
| `app-chrome-title` | title text in the top bar |
| `app-body` | scrollable content area below the chrome |
| `card` | white/dark rounded card |
| `pz-btn` | accent-coloured button |
| `pz-btn secondary` | muted button |
| `pz-input` | styled text input |
| `tab-bar` / `tab-bar-btn` | horizontal tab strip |
| `empty-state` | centred icon + message for empty lists |

---

## API reference

All modules are importable in built-in apps. For Store/sideloaded apps that are `eval`'d, everything is available on `window.PocketZero`:

```js
const { Router, Store, Notify, Dialog, EventBus, Badge, Sound, Http, AppRegistry } = window.PocketZero;
```

---

### AppRegistry

```js
AppRegistry.register({ id, name, icon, render, removable })
AppRegistry.getAll()        // → all registered apps
AppRegistry.getById(id)     // → app object or null
AppRegistry.remove(id)      // unregisters a removable app
```

---

### Router — navigation

```js
Router.open(appId)    // open an app (zoom-in animation)
Router.back()         // go to the previous screen
Router.home()         // close app and return to home screen
Router.getCurrent()   // → current open appId or null
```

---

### Store — localStorage wrapper

Keys are namespaced automatically so apps don't collide.

```js
Store.get(key)          // → parsed value or null
Store.set(key, value)   // JSON-serialises and saves
Store.remove(key)       // delete one key
Store.clear()           // wipe all PocketZero data
```

---

### Notify — top banner toast

```js
Notify.show('Saved!')               // auto-dismisses after 3s
Notify.show('Copied', 1500)         // custom duration in ms
```

---

### Dialog — modal popups (async/await)

```js
// Alert
await Dialog.alert('Something went wrong')
await Dialog.alert('Message', 'Title')

// Confirm — returns true or false
const confirmed = await Dialog.confirm('Delete this?')
const confirmed = await Dialog.confirm('Sure?', 'Title', 'Yes', 'No')

// Prompt — returns the string entered, or null if cancelled
const name = await Dialog.prompt('Enter a name')
const name = await Dialog.prompt('Enter a name', 'default', 'Title', 'placeholder…')
```

---

### EventBus — pub/sub between apps

```js
EventBus.on('event:name', handler)      // subscribe
EventBus.once('event:name', handler)    // subscribe, fires once then unsubscribes
EventBus.off('event:name', handler)     // unsubscribe
EventBus.emit('event:name', payload)    // fire event
EventBus.clear('event:name')            // remove all listeners for one event
EventBus.clear()                        // remove all listeners everywhere
```

System events the shell emits:

| Event | Payload | When |
|---|---|---|
| `theme:changed` | `'light'` or `'dark'` | User changes theme in Settings |

---

### Badge — home screen icon bubbles

```js
Badge.set('yourapp', 3)   // show red badge with number
Badge.set('yourapp', 0)   // remove badge
Badge.get('yourapp')       // → current count
Badge.increment('yourapp')
Badge.decrement('yourapp') // floors at 0
Badge.clear()              // remove all badges
Badge.refresh()            // re-render badges after home screen rebuild
```

---

### Sound — Web Audio tones

All calls silently no-op when the user has muted sound in Settings.

```js
Sound.click()                      // soft UI tick
Sound.beep()                       // simple beep
Sound.tone(440, 0.3)               // frequency Hz, duration seconds
Sound.tone(440, 0.3, 0.5)          // + gain (0–1)
Sound.chord([261, 329, 392])       // play multiple notes at once
Sound.success()                    // rising 3-note chime
Sound.error()                      // low buzz
Sound.notify()                     // soft two-tone ping
Sound.alarm(3)                     // repeating alarm, N times
```

---

### Http — fetch wrapper

Returns parsed JSON automatically when the server responds with `Content-Type: application/json`, otherwise returns raw text.

```js
const data = await Http.get('https://api.example.com/data')
const data = await Http.get(url, { timeout: 5000 })

const result = await Http.post(url, { key: 'value' })
const result = await Http.put(url, body)
const result = await Http.delete(url)
```

---

---

### Background — persistent background apps

Lets an app stay loaded and running after the user navigates home. Audio, state, and DOM are fully preserved. The app's `render` function is only ever called once — reopening it just makes the container visible again.

```js
import { Background } from './background.js';

// Declare this before AppRegistry.register() — marks the app as background-capable
Background.register('myapp');

// Check if an app is registered for background mode
Background.isRegistered('myapp')   // → true

// Check if the app has been opened at least once (container exists)
Background.isAlive('myapp')        // → true / false

// Permanently destroy a background app's container (e.g. on uninstall)
Background.kill('myapp')
```

The Router handles everything else automatically — `Router.open()` and `Router.home()` both detect background-registered apps and mount/suspend instead of render/destroy.

**Music** uses this so audio keeps playing when you leave the app.

To make any other app background-capable, just add two lines to it:

```js
import { Background } from './background.js';
Background.register('yourappid');
```

> For Store/sideloaded apps: `window.PocketZero.Background` exposes the same API.

## Adding an app to the Store catalog

Apps in `apps/store-catalog.js` appear in the **Browse** tab of the Store app. Each entry needs an `id`, `name`, `category`, `description`, and `version`. The actual app code is loaded separately.

```js
{
  id: 'yourapp',
  name: 'My App',
  category: 'Utilities',   // Games | Productivity | Utilities
  description: 'One sentence about what it does.',
  version: '1.0.0',
}
```

---

## File structure

```
index.html          shell HTML
style.css           global styles + CSS variables
main.js             boots the shell, exposes window.PocketZero
manifest.json       PWA manifest
sw.js               service worker (offline cache)

apps/
  index.js          import your app here to register it
  registry.js       AppRegistry
  router.js         Router
  store.js          Store
  notify.js         Notify
  dialog.js         Dialog
  eventbus.js       EventBus
  badge.js          Badge
  sound.js          Sound
  http.js           Http
  store-catalog.js  list of Store apps
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
  games/
    snake.js

icons/
  svg.js            all SVG icon strings as named exports
```
