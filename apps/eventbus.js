// EventBus — simple pub/sub for inter-app communication
// Usage:
//   EventBus.on('task:added', (task) => console.log(task))
//   EventBus.emit('task:added', { id: '1', text: 'Buy milk' })
//   EventBus.off('task:added', handlerFn)
//   EventBus.once('app:opened', (id) => ...)

const listenerMap = new Map();

export const EventBus = {
    /**
     * Subscribe to an event.
     * @param {string} eventName
     * @param {Function} handlerFn
     */
    on(eventName, handlerFn) {
        if (!listenerMap.has(eventName)) {
            listenerMap.set(eventName, new Set());
        }
        listenerMap.get(eventName).add(handlerFn);
    },

    /**
     * Subscribe to an event once — auto-removes after first call.
     * @param {string} eventName
     * @param {Function} handlerFn
     */
    once(eventName, handlerFn) {
        const wrapper = (...args) => {
            handlerFn(...args);
            EventBus.off(eventName, wrapper);
        };
        EventBus.on(eventName, wrapper);
    },

    /**
     * Unsubscribe from an event.
     * @param {string} eventName
     * @param {Function} handlerFn
     */
    off(eventName, handlerFn) {
        listenerMap.get(eventName)?.delete(handlerFn);
    },

    /**
     * Emit an event, calling all subscribed handlers with the payload.
     * @param {string} eventName
     * @param {*} [payload]
     */
    emit(eventName, payload) {
        listenerMap.get(eventName)?.forEach((handler) => {
            try {
                handler(payload);
            } catch (error) {
                console.error(`EventBus: error in handler for "${eventName}"`, error);
            }
        });
    },

    /**
     * Remove all listeners for a given event, or all listeners entirely.
     * @param {string} [eventName] — omit to clear everything
     */
    clear(eventName) {
        if (eventName) {
            listenerMap.delete(eventName);
        } else {
            listenerMap.clear();
        }
    },
};

// Built-in system events emitted by the shell:
//   'app:opened'   payload: appId (string)
//   'app:closed'   payload: appId (string)
//   'theme:changed' payload: 'light' | 'dark'
//   'store:cleared' payload: undefined
