const { app, BrowserWindow, ipcMain, ipcRenderer, remote, electron } = require("electron");
const fs = require('fs');
const path = require('path');
const { autoUpdater, AppUpdater } = require("electron-updater");
var win;
var openFilePath;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: "assets/icon.png",
    autoHideMenuBar: true,
    backgroundColor: '#1d1d1d',
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      enableRemoteModule: true,
      contextIsolation: false,
      webviewTag: true,
    }
  });
  require('@electron/remote/main').initialize()
  require('@electron/remote/main').enable(win.webContents)

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  const args = process.argv.slice(1);
  if (args.length > 0 && fs.existsSync(args[0])) {
    openFilePath = args[0];
  }
  createWindow()

  if (openFilePath) {
    win.webContents.once('did-finish-load', () => {
      win.webContents.send('open-file', openFilePath);
    });
  }

  autoUpdater.checkForUpdates();
  console.log(`Checking for updates. Current version ${app.getVersion()}`);
})

autoUpdater.on("update-available", (info) => {
  console.log(`Update available. Current version ${app.getVersion()}`);
});

autoUpdater.on("update-not-available", (info) => {
  console.log(`No update available. Current version ${app.getVersion()}`);
});

autoUpdater.on("update-downloaded", (info) => {
  console.log(`Update downloaded. Current version ${app.getVersion()}`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  openFilePath = filePath;
  if (win) {
    win.webContents.send('open-file', openFilePath);
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  if (openFilePath && win) {
    win.webContents.send('open-file', openFilePath);
  }
});