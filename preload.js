const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('winDesktopAPI', {
    isDesktopApp: true,
    getStorageInfo: () => ipcRenderer.invoke('storage:get-info'),
    chooseStorageFolder: () => ipcRenderer.invoke('storage:choose-folder'),
    openStorageExplorer: () => ipcRenderer.invoke('storage:open-explorer'),
    saveRealtimeToDisk: (payload) => ipcRenderer.invoke('storage:save-realtime', payload),
    loadDiskDatabase: () => ipcRenderer.invoke('storage:load-disk-db')
});