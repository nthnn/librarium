const { MSICreator } = require("electron-wix-msi");
const path = require("node:path");

const msiCreator = new MSICreator({
    appDirectory: path.resolve(__dirname, "./librarium-win32-x64"),
    outputDirectory: path.resolve(__dirname, "./librarium-installer"),
    description: "Automated library system with Arduino UNO and Electron.",
    exe: "librarium",
    name: "Librarium",
    manufacturer: "nthnn",
    version: "1.0.0",
    shortcutName: "Librarium",
    icon: path.resolve(__dirname, "./librarium-app/assets/librarium-logo.ico"),
    upgradeCode: "CCAC3B96-681E-4998-B69D-F46B1F760480",
    ui: {chooseDirectory: true}
});

msiCreator.create().then(function(){
    msiCreator.compile();
});