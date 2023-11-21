const { contextBridge } = require('electron')

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