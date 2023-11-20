const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronReload = require('electron-reload');
const Store = require('electron-store');
const { HubConnectionBuilder, LogLevel } = require('@microsoft/signalr');


const parentDir = path.join(__dirname, '..');
electronReload(parentDir);

const store = new Store();
let mainWindow;

function createWindow() {

    const windowBounds = store.get('windowBounds') || { width: 800, height: 600 };

    mainWindow = new BrowserWindow({
        width: windowBounds.width,
        height: windowBounds.height,
        x: windowBounds.x,
        y: windowBounds.y,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
        // alwaysOnTop: true
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        if (hubConnection)
            hubConnection.stop();
        mainWindow = null;
    });

    const hubConnection = new HubConnectionBuilder()
        .withUrl('http://localhost:5000/chatHub')
        .configureLogging(LogLevel.Debug)
        .build();

    hubConnection.start()
        .then(() => {
            console.log('SignalR hub is connected!');
        })
        .catch(err => console.error(err));

    hubConnection.on('messageReceived', (user, message) => {
        console.log(`${user}: ${message}`);
    });

}
app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
