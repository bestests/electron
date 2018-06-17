const memoRender = {
    sendNewMemo: (ipcRenderer) => {
        ipcRenderer.send("New-Memo");
    },
    closeMemo: (ipcRenderer, idx) => {
        ipcRenderer.send("Close-Memo", {idx: idx});
    },
    sendMemoDetail: (ipcRenderer, obj) => {
        console.log(obj);
        ipcRenderer.send("SAVE-TEXT", obj);
    }
};

exports.memoRender = memoRender;