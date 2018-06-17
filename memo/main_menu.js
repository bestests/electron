const { remote, ipcRenderer } = require("electron");
const { Menu, MenuItem } = remote;

const template = [
    {
        label: "Window",
        submenu: [
            {
                label: "Save & Exit",
                click() {
                    ipcRenderer.send("SAVE_EXIT");
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);