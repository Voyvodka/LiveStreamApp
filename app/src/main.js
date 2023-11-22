const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const electronReload = require('electron-reload');
const Store = require('electron-store');

const parentDir = path.join(__dirname, '..');
electronReload(parentDir);

const store = new Store();
let mainWindow;

function createWindow() {

    const windowBounds = store.get('windowBounds') || { width: 1000, height: 750 };

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
        mainWindow = null;
    });

}

// const videoElement = document.querySelector('video');
// const startBtn = document.querySelector('#startBtn');
// const stopBtn = document.querySelector('#stopBtn');
// const videoSelectBtn = document.querySelector('#videoSelectBtn');
// videoSelectBtn.onclick = () => getVideoSources();


app.whenReady().then(() => {
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (const source of sources) {
            if (source.name === 'Electron') {
                mainWindow.webContents.send('SET_SOURCE', source.id)
                return
            }
        }
    })
    getVideoSources()

    ipcMain.handle('ping', () => 'pong')
    createWindow()
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

ipcMain.handle('getDesktopCapturerSources', async () => {
    try {
        const sources = await desktopCapturer.getSources({ types: ['screen'] });
        return sources;
    } catch (error) {
        console.error('Error getting desktop capturer sources:', error.message);
        throw error;
    }
});



async function getVideoSources() {
    try {
        const inputSources = await desktopCapturer.getSources({
            types: ['window', 'screen']
        }).then(async sources => {
            for (const source of sources) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id
                            }
                        }
                    });
                    console.log(stream);
                } catch (err) {
                    console.error('Error accessing screen:', err);
                }
            }
        });
        for (let item of inputSources) {
            // console.log(item);
            // console.log(item.thumbnail.toPNG());
        }

    } catch (error) {
        console.error('Error getting video sources:', error.message);
    }
}

async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: 2528732444
            }
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        videoElement.srcObject = stream;
        videoElement.play();
    } catch (error) {
        console.error('Error selecting video source:', error.message);
    }
}