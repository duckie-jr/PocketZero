const STORAGE_PREFIX = 'pz_';

export const Store = {
    get(key) {
        const rawValue = localStorage.getItem(STORAGE_PREFIX + key);
        if (rawValue === null) return null;
        try {
            return JSON.parse(rawValue);
        } catch {
            return rawValue;
        }
    },

    set(key, value) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    },

    remove(key) {
        localStorage.removeItem(STORAGE_PREFIX + key);
    },

    clear() {
        Object.keys(localStorage)
            .filter((storageKey) => storageKey.startsWith(STORAGE_PREFIX))
            .forEach((storageKey) => localStorage.removeItem(storageKey));
    },
};
