const STORAGE_PREFIX = 'pz_';

// storageKey → Set<callback>. Holds same-tab subscriber callbacks per full storage key.
const subscriberMap = new Map();

// Broadcast changes to same-tab subscribers whenever a value is written or removed.
function notifySubscribers(fullStorageKey, newValue) {
    const callbacks = subscriberMap.get(fullStorageKey);
    if (callbacks) callbacks.forEach((callback) => callback(newValue));
}

// Cross-tab: fire subscribers when another tab writes to localStorage.
window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(STORAGE_PREFIX)) return;
    const callbacks = subscriberMap.get(event.key);
    if (!callbacks) return;

    let parsedValue = null;
    if (event.newValue !== null) {
        try {
            parsedValue = JSON.parse(event.newValue);
        } catch {
            parsedValue = event.newValue;
        }
    }
    callbacks.forEach((callback) => callback(parsedValue));
});

/**
 * Internal: read and parse a raw localStorage value.
 * Returns null if the key is missing.
 * Returns null and removes the key if the value has an expired TTL.
 */
function readEntry(fullStorageKey) {
    const raw = localStorage.getItem(fullStorageKey);
    if (raw === null) return null;

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return raw;
    }

    // Check for TTL wrapper written by set() with { ttlMs }
    if (parsed !== null && typeof parsed === 'object' && '__pz_expires__' in parsed) {
        if (Date.now() > parsed.__pz_expires__) {
            localStorage.removeItem(fullStorageKey);
            notifySubscribers(fullStorageKey, null);
            return null;
        }
        return parsed.value;
    }

    return parsed;
}

/**
 * Internal: write a value (with optional TTL) and notify subscribers.
 */
function writeEntry(fullStorageKey, value, ttlMs) {
    const payload = ttlMs != null
        ? { __pz_expires__: Date.now() + ttlMs, value }
        : value;
    localStorage.setItem(fullStorageKey, JSON.stringify(payload));
    notifySubscribers(fullStorageKey, value);
}

/**
 * Create a Store instance scoped to an optional namespace prefix.
 * Exported as Store = createStore() — all apps import the root instance.
 * Call Store.namespace('myapp') to get an isolated sub-store.
 *
 * @param {string} [namespace] - Optional dot-separated namespace prefix.
 */
function createStore(namespace = '') {
    function buildFullKey(key) {
        return STORAGE_PREFIX + (namespace ? `${namespace}:${key}` : key);
    }

    const store = {
        // ── Core read / write ─────────────────────────────────

        /**
         * Get a stored value. Returns null if the key is missing or expired.
         */
        get(key) {
            return readEntry(buildFullKey(key));
        },

        /**
         * Get a stored value, or return defaultValue if the key is missing.
         * This replaces the common pattern: Store.get('x') ?? defaultValue
         */
        getOrDefault(key, defaultValue) {
            const value = readEntry(buildFullKey(key));
            return value !== null ? value : defaultValue;
        },

        /**
         * Write a value to storage.
         * @param {string} key
         * @param {*} value
         * @param {{ ttlMs?: number }} [options] - Optional TTL in milliseconds.
         */
        set(key, value, options = {}) {
            writeEntry(buildFullKey(key), value, options.ttlMs);
        },

        /**
         * Returns true if the key exists and has not expired.
         */
        has(key) {
            return readEntry(buildFullKey(key)) !== null;
        },

        /**
         * Remove a key from storage.
         */
        remove(key) {
            const fullKey = buildFullKey(key);
            localStorage.removeItem(fullKey);
            notifySubscribers(fullKey, null);
        },

        /**
         * Remove all keys belonging to this namespace (or all pz_ keys for root).
         */
        clear() {
            store.keys().forEach((key) => store.remove(key));
        },

        // ── Atomic helpers ────────────────────────────────────

        /**
         * Read-modify-write in one call.
         * The updater receives the current value (or null) and must return the new value.
         * Returns the new value.
         *
         * Example: Store.update('count', (n) => (n ?? 0) + 1)
         */
        update(key, updaterFn) {
            const currentValue = store.get(key);
            const nextValue = updaterFn(currentValue);
            store.set(key, nextValue);
            return nextValue;
        },

        /**
         * Append an item to a stored array.
         * Creates the array automatically if the key is missing.
         * Returns the updated array.
         */
        push(key, item) {
            return store.update(key, (existing) => {
                const currentArray = Array.isArray(existing) ? existing : [];
                return [...currentArray, item];
            });
        },

        /**
         * Remove and return the last item from a stored array.
         * Returns undefined if the array is empty or the key is missing.
         */
        pop(key) {
            let removedItem;
            store.update(key, (existing) => {
                if (!Array.isArray(existing) || existing.length === 0) {
                    removedItem = undefined;
                    return existing;
                }
                removedItem = existing[existing.length - 1];
                return existing.slice(0, -1);
            });
            return removedItem;
        },

        /**
         * Increment a stored number by `amount` (default 1).
         * Starts from 0 if the key is missing.
         * Returns the new value.
         */
        increment(key, amount = 1) {
            return store.update(key, (current) => (Number(current) || 0) + amount);
        },

        /**
         * Decrement a stored number by `amount` (default 1).
         * Returns the new value.
         */
        decrement(key, amount = 1) {
            return store.increment(key, -amount);
        },

        /**
         * Toggle a stored boolean.
         * Returns the new value.
         */
        toggle(key) {
            return store.update(key, (current) => !current);
        },

        // ── Enumeration ───────────────────────────────────────

        /**
         * Return all keys belonging to this namespace, without the storage prefix.
         */
        keys() {
            const keyPrefix = buildFullKey('');
            return Object.keys(localStorage)
                .filter((storageKey) => storageKey.startsWith(keyPrefix))
                .map((storageKey) => storageKey.slice(keyPrefix.length));
        },

        /**
         * Return all key-value pairs for this namespace as a plain object.
         * Expired TTL entries are excluded and cleaned up.
         */
        getAll() {
            return Object.fromEntries(
                store.keys()
                    .map((key) => [key, store.get(key)])
                    .filter(([, value]) => value !== null)
            );
        },

        // ── Reactivity ────────────────────────────────────────

        /**
         * Subscribe to changes for a single key.
         * Fires on both same-tab writes and cross-tab StorageEvents.
         *
         * @param {string} key
         * @param {(newValue: any) => void} callback - Called with the new value (null on removal).
         * @returns {() => void} Unsubscribe function.
         *
         * Example:
         *   const unsub = Store.subscribe('theme', (theme) => applyTheme(theme));
         *   // Later: unsub();
         */
        subscribe(key, callback) {
            const fullKey = buildFullKey(key);
            if (!subscriberMap.has(fullKey)) subscriberMap.set(fullKey, new Set());
            subscriberMap.get(fullKey).add(callback);

            return function unsubscribe() {
                subscriberMap.get(fullKey)?.delete(callback);
            };
        },

        // ── Namespacing ───────────────────────────────────────

        /**
         * Create a child Store scoped to a sub-namespace.
         * Keys are stored as: pz_<namespace>:<subNamespace>:<key>
         *
         * Example:
         *   const weatherStore = Store.namespace('weather');
         *   weatherStore.set('city', 'London');  // stored as pz_weather:city
         */
        namespace(subNamespace) {
            return createStore(namespace ? `${namespace}:${subNamespace}` : subNamespace);
        },

        // ── Backup / restore ──────────────────────────────────

        /**
         * Serialize all namespace data to a JSON string.
         * Useful for settings export or cloud backup.
         */
        export() {
            return JSON.stringify(store.getAll());
        },

        /**
         * Restore data from a JSON string produced by export().
         * Merges into existing data — does not clear first.
         *
         * @param {string} jsonString
         */
        import(jsonString) {
            const entries = JSON.parse(jsonString);
            Object.entries(entries).forEach(([key, value]) => store.set(key, value));
        },

        // ── Diagnostics ───────────────────────────────────────

        /**
         * Estimate the number of bytes used by this namespace in localStorage.
         */
        byteSize() {
            return store.keys().reduce((totalBytes, key) => {
                const fullKey = buildFullKey(key);
                const storedValue = localStorage.getItem(fullKey) ?? '';
                return totalBytes + fullKey.length + storedValue.length;
            }, 0);
        },
    };

    return store;
}

export const Store = createStore();
