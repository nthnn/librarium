const { app, BrowserWindow, globalShortcut } = require('electron');
require('@electron/remote/main').initialize();

app.on('ready', ()=> {
    let mainWindow = new BrowserWindow({
        width: 1100,
        height: 700,
        autoHideMenuBar: true,
        icon: "assets/librarium-logo.ico",
        title: "Librarium",
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
});

app.on("browser-window-created", (_, window) => {
    require("@electron/remote/main").enable(window.webContents);
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin")
        app.quit();
});