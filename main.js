const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const configFilePath = path.join(app.getPath('userData'), 'storage-config.json');

function getStorageDirectory() {
    try {
        if (fs.existsSync(configFilePath)) {
            const cfg = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
            if (cfg.storageDir && fs.existsSync(cfg.storageDir)) {
                return cfg.storageDir;
            }
        }
    } catch (e) {}
    const defaultDir = path.join(app.getPath('documents'), 'PriceActionJournalData');
    if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir, { recursive: true });
    }
    return defaultDir;
}

function getDatabaseFilePath() {
    return path.join(getStorageDirectory(), 'journal_database_v3.json');
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 920,
        minWidth: 1024,
        minHeight: 700,
        title: 'Price Action Trading Journal',
        backgroundColor: '#1E1E1E',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for Native Windows Storage & Real-Time Auto-Save
ipcMain.handle('storage:get-info', async () => {
    const dir = getStorageDirectory();
    const dbFile = getDatabaseFilePath();
    return { storageDir: dir, dbFile: dbFile };
});

ipcMain.handle('storage:choose-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'انتخاب پوشه ذخیره‌سازی ژورنال معاملاتی / Select Storage Folder',
        defaultPath: getStorageDirectory(),
        properties: ['openDirectory', 'createDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const chosenDir = result.filePaths[0];
        const oldDbFile = getDatabaseFilePath();
        fs.writeFileSync(configFilePath, JSON.stringify({ storageDir: chosenDir }, null, 2), 'utf-8');
        const newDbFile = getDatabaseFilePath();
        if (fs.existsSync(oldDbFile) && !fs.existsSync(newDbFile)) {
            fs.copyFileSync(oldDbFile, newDbFile);
        }
        return { success: true, storageDir: chosenDir, dbFile: newDbFile };
    }
    return { success: false };
});

ipcMain.handle('storage:open-explorer', async () => {
    const dir = getStorageDirectory();
    await shell.openPath(dir);
    return true;
});

ipcMain.handle('storage:save-realtime', async (event, payloadObj) => {
    try {
        const dbFile = getDatabaseFilePath();
        fs.writeFileSync(dbFile, JSON.stringify(payloadObj, null, 2), 'utf-8');
        return { success: true, path: dbFile, timestamp: Date.now() };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('storage:load-disk-db', async () => {
    try {
        const dbFile = getDatabaseFilePath();
        if (fs.existsSync(dbFile)) {
            const raw = fs.readFileSync(dbFile, 'utf-8');
            return { success: true, data: JSON.parse(raw), path: dbFile };
        }
    } catch (err) {}
    return { success: false };
});