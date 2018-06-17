const $ = require("jQuery");
const { remote, ipcRenderer } = require("electron");
const { Menu, MenuItem } = remote;
const render = require("./memo_render.js");

const menu = new Menu();

// html event start
var timer = 0;
$("textarea").on("input", function (e) {
    let $this = $(this);
    clearTimeout(timer);
    timer = setTimeout(() => {
        let thisVal = $this.val();
        if(thisVal) {
            thisVal = encodeURI(thisVal);
        }
        render.memoRender.sendMemoDetail(ipcRenderer, {id: remote.getCurrentWindow().id, text: thisVal});
    }, 250);
});

// html event end

// context menu start

menu.append(new MenuItem({label: "New Memo", click() {
    render.memoRender.sendNewMemo(ipcRenderer);
}}));

menu.append(new MenuItem({label: "Close", click() {
    render.memoRender.closeMemo(ipcRenderer, remote.getCurrentWindow().id);
}}));

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    menu.popup({window: remote.getCurrentWindow()})
}, false);

// context menu end

// ipcRenderer.on Start

ipcRenderer.on("Close-Memo-Reply", (event, obj) => {
    remote.getCurrentWindow().close();    
});

// ipcRenderer.on End