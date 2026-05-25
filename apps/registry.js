const registeredApps = [];

export const AppRegistry = {
    register(appDefinition) {
        const alreadyRegistered = registeredApps.some(
            (existingApp) => existingApp.id === appDefinition.id
        );
        if (alreadyRegistered) return;
        registeredApps.push(appDefinition);
    },

    getAll() {
        return [...registeredApps];
    },

    remove(appId) {
        const appIndex = registeredApps.findIndex((app) => app.id === appId);
        if (appIndex === -1) return;
        const targetApp = registeredApps[appIndex];
        if (!targetApp.removable) return;
        registeredApps.splice(appIndex, 1);
    },

    getById(appId) {
        return registeredApps.find((app) => app.id === appId) ?? null;
    },
};
