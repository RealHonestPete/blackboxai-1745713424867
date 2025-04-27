const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { windowManager } = require('node-window-manager');

let mainWindow;
let gameClientWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('src/ui/index.html');
}

function createWindowSelector() {
    const selectorWindow = new BrowserWindow({
        width: 600,
        height: 400,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    selectorWindow.loadFile('src/ui/client-selector.html');
    return selectorWindow;
}

app.whenReady().then(() => {
    createMainWindow();

    ipcMain.handle('list-windows', () => {
        const windows = windowManager.getWindows();
        return windows.map(win => ({
            id: win.id,
            title: win.getTitle(),
            bounds: win.getBounds()
        }));
    });

    ipcMain.handle('select-game-client', (event, windowId) => {
        const win = windowManager.getWindow(windowId);
        if (win) {
            gameClientWindow = win;
            return true;
        }
        return false;
    });

    ipcMain.handle('get-game-client-bounds', () => {
        if (gameClientWindow) {
            return gameClientWindow.getBounds();
        }
        return null;
    });

    ipcMain.on('open-window-selector', () => {
        createWindowSelector();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
