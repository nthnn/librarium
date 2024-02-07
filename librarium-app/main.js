const { app, BrowserWindow, globalShortcut } = require('electron');
require('@electron/remote/main').initialize();

let mainWindow;
function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 1300,
        height: 720,
        autoHideMenuBar: true,
        icon: "assets/librarium-logo.ico",
        title: "Librarium",
        resizable: false,
        titleBarOverlay: {
            color: "#fff",
            symbolColor: "#1a1a1a",
            height: 35
        },
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    if(process.platform == "darwin") {
        globalShortcut.register("Command+Option+I", () => { return false; });
        globalShortcut.register("Command+R", () => { return false; });
        globalShortcut.register("Command+W", () => { return false; });
    }
    else {
        globalShortcut.register("Control+Shift+I", () => { return false; });
        globalShortcut.register("Control+R", () => { return false; });
        globalShortcut.register("Control+W", () => { return false; });
    }

    mainWindow.loadFile("index.html");
    mainWindow.on("closed", () => mainWindow = null);
}

app.on('ready', createWindow);

app.on("browser-window-created", (_, window) => {
    require("@electron/remote/main").enable(window.webContents);
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin")
        app.quit();
});

ipcMain.on("restart", () => {
    app.relaunch();
    app.quit();
});