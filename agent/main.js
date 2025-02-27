const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let win = null;

app.whenReady().then(() => {

    tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Dashboard', click: createWindow },
        { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('Intelligent Backup System');
    tray.setContextMenu(contextMenu);
});

function createWindow() {
    if (!win) {
        win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: { nodeIntegration: true }
        });
        win.loadFile('index.html');
        win.on('closed', () => { win = null; });
    }
}
