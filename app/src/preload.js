const { contextBridge, ipcRenderer } = require('electron')

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        })
        handleStream(stream)
    } catch (e) {
        handleError(e)
    }
})

function handleStream(stream) {
    const video = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => video.play()
}

function handleError(e) {
    console.log(e)
}

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})

window.addEventListener('DOMContentLoaded', () => {
    const { ipcRenderer } = require('electron');
    console.log(ipcRenderer);

    ipcRenderer.on('newMessage', (event, data) => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML += `<p>${data.user}: ${data.message}</p>`;
    });
});