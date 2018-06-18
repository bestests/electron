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
        ipcRenderer.send("SAVE-TEXT", obj);
    },
    savePosition: (ipcRenderer, obj) => {
        ipcRenderer.send("SAVE-POSITION", obj);
    },
    saveSize: (ipcRenderer, obj) => {
        ipcRenderer.send("SAVE-SIZE", obj);
    }
};

exports.memoRender = memoRender;
