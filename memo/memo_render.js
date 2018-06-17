const memoRender = {
    memoInit: (ipcRenderer, obj) => {
        ipcRenderer.send("MEMOINIT", obj);
    },
    sendNewMemo: (ipcRenderer) => {
        ipcRenderer.send("New-Memo");
    },
    closeMemo: (ipcRenderer, idx) => {
        ipcRenderer.send("Close-Memo", {idx: idx});
    },
    sendMemoDetail: (ipcRenderer, obj) => {
        console.log(obj);
        ipcRenderer.send("SAVE-TEXT", obj);
    },
    savePosition: (ipcRenderer, obj) => {
        console.log(obj);
        ipcRenderer.send("SAVE-POSITION", obj);
    }
};

exports.memoRender = memoRender;