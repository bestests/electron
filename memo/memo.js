const $ = require("jQuery");
const { remote, ipcRenderer } = require("electron");
const { Menu, MenuItem } = remote;
const render = require("./memo_render.js").memoRender;

const menu    = new Menu();
const thisWin = remote.getCurrentWindow();

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

        render.sendMemoDetail(ipcRenderer, {id: thisWin.id, text: thisVal});
    }, 250);
});

remote.getCurrentWindow().on("move", () => {

    let [ x, y ] = thisWin.getPosition();

    if(timer) clearTimeout(timer);

    timer = setTimeout(() => {
        timer = null;
        render.savePosition(ipcRenderer, {id: thisWin.id, x: x, y: y});
    }, 250);
});

remote.getCurrentWindow().on("resize", () => {

    let [ width, height ] = thisWin.getSize();

    render.saveSize(ipcRenderer, {id: thisWin.id, width: width, height: height});
});

remote.getCurrentWindow().on("show", () => {
    render.memoInit(ipcRenderer, {id: thisWin.id});
});

// html event end

// context menu start

menu.append(new MenuItem({label: "New Memo", click() {
    render.sendNewMemo(ipcRenderer);
}}));

menu.append(new MenuItem({label: "Close", click() {
    render.closeMemo(ipcRenderer, thisWin.id);
}}));

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    menu.popup({window: thisWin})
}, false);

// context menu end

// ipcRenderer.on Start

ipcRenderer.on("MEMOINIT-reply", (event, obj) => {
    if(obj.text) {
        $("#textObj").val(decodeURI(obj.text));
    }
});

ipcRenderer.on("Close-Memo-Reply", (event, obj) => {
    thisWin.close();
});

// ipcRenderer.on End
