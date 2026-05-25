# PocketZero

A simplified iOS-inspired web app for desktop and landscape phones. No frameworks, no build step required beyond a static file server.

## Running locally

```bash
npx vite
# or open index.html with any static file server
```

## Adding a new app (2 steps)

1. Create `apps/yourapp.js` and call `AppRegistry.register(...)` inside it
2. Add `import './yourapp.js'` to `apps/index.js`

Done — the icon appears on the home screen automatically.

---

## Full App API

Every app has access to the full API via `window.PocketZero` (for custom/store apps) or via ES module imports (for built-in apps).

### AppRegistry

```js
AppRegistry.register({ id, name, icon, render, removable })
AppRegistry.getAll()       // returns array of all registered apps
AppRegistry.getById(id)    // returns one app or null
AppRegistry.remove(id)     // removes a removable:true app
```

### Router

```js
Router.open(appId)    // open an app (zoom-in animation)
Router.back()         // go to previous app
Router.home()         // close app, return to home screen
Router.getCurrent()   // returns current open appId or null
```

### Store  — localStorage wrapper

```js
Store.get(key)           // returns parsed value or null
Store.set(key, value)    // JSON-serializes and saves
Store.remove(key)        // deletes one key
Store.clear()            // wipes all PocketZero data
```

### Notify  — top banner

```js
Notify.show(message)                  // shows for 3s
Notify.show(message, durationMs)      // custom duration
```

### Dialog  — iOS-style modals (async/await)

```js
await Dialog.alert('Something happened')
await Dialog.alert('Message', 'Title')

const confirmed = await Dialog.confirm('Delete this?')
const confirmed = await Dialog.confirm('Sure?', 'Confirm', 'Yes', 'No')

const name = await Dialog.prompt('Enter name')
const name = await Dialog.prompt('Enter name', 'Default', 'Title', 'Placeholder')
// returns null if cancelled
```

### EventBus  — pub/sub inter-app messaging

```js
EventBus.on('task:added', (task) => console.log(task))
EventBus.once('app:opened', (id) => console.log(id))
EventBus.off('task:added', handlerFn)
EventBus.emit('task:added', { id: '1', text: 'Buy milk' })
EventBus.clear('task:added')   // clear listeners for one event
EventBus.clear()               // clear all listeners
```

**Built-in system events emitted by the shell:**

| Event | Payload |
|---|---|
| `theme:changed` | `'light'` or `'dark'` |

### Badge  — home screen icon badges

```js
Badge.set('todo', 3)      // show red bubble with "3"
Badge.set('todo', 0)      // remove badge
Badge.get('todo')         // returns current count (number)
Badge.increment('todo')   // count + 1
Badge.decrement('todo')   // count - 1 (min 0)
Badge.clear()             // remove all badges
Badge.refresh()           // re-render after home screen rebuild
```

### Sound  — Web Audio tones (respects global mute)

```js
Sound.click()             // soft button press tick
Sound.beep()              // simple beep
Sound.tone(440, 0.3)      // frequency Hz, duration seconds
Sound.tone(440, 0.3, 0.5) // + gain 0–1
Sound.chord([261, 329, 392])  // play notes together
Sound.success()           // rising 3-note chime
Sound.error()             // low buzz
Sound.notify()            // soft ping
Sound.alarm(3)            // repeating alarm (N times)
```

### Http  — fetch wrapper with JSON + timeout

```js
// GET — returns parsed JSON or text
const data = await Http.get('https://api.open-meteo.com/...')
const data = await Http.get(url, { timeout: 5000 })

// POST — sends JSON body, returns response
const result = await Http.post(url, { key: 'value' })

// PUT / DELETE
const result = await Http.put(url, body)
const result = await Http.delete(url)

// Full response object { data, status, ok }
const { data, status } = await Http.request(url, fetchOptions)
```

---

## File structure

```
index.html              ← single HTML shell
style.css               ← global styles + CSS variables
main.js                 ← boots shell, exposes window.PocketZero
icons/
  svg.js                ← all SVG strings as named exports
apps/
  index.js              ← ONLY file to edit when adding a new app
  registry.js           ← AppRegistry module
  store.js              ← Store module
  router.js             ← Router module
  notify.js             ← Notify module
  dialog.js             ← Dialog module
  eventbus.js           ← EventBus module
  badge.js              ← Badge module
  sound.js              ← Sound module
  http.js               ← Http module
  weather.js
  clock.js
  calculator.js
  notes.js
  todo.js
  calendar.js
  music.js
  browser.js
  settings.js
  playstore.js
  store-catalog.js
  games/
    snake.js
```

## Tech

- Vanilla HTML / CSS / JS — no framework, no build step
- `localStorage` for all persistence
- [Open-Meteo](https://open-meteo.com/) for weather (free, no API key)
- CSS custom properties for light/dark theming
- Desktop and landscape phone only (portrait phone shows rotate screen)
