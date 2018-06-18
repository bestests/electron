const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");

let mainWin;
const memoObj = {};
var saveObj = {};

const init = () => {

    let isNew = true;

    mainWin = new BrowserWindow({width:600, height: 400, /*transparent: true, frame: false*/});

    mainWin.loadFile("./main.html");
    mainWin.show();

    let fileData = fs.readFileSync("./save.txt", (err) => {
        if(err) {
            console.error(err);
        }
    }).toString();

    if(fileData) {
        var saveObj = JSON.parse(fileData);

        for(let i in saveObj) {

            let saveMemo = saveObj[i];

            if(saveMemo) {
                let { x, y, width, height, text } = saveMemo;

                createMemo({x: x, y:y, width: width, height: height, text: text});
                isNew = false;
            }
        }
    }

    if(isNew) {
        createMemo();
    }
};

const createMemo = (obj) => {
    console.log(obj);
    let options = {
        width: 300,
        height: 300,
        backgroundColor: "#ffff00",
        frame: false,
        show: false
    };

    let text = "";

    if(obj) {
        if(obj.x)      options.x      = obj.x;
        if(obj.y)      options.y      = obj.y;
        if(obj.width)  options.width  = obj.width;
        if(obj.height) options.height = obj.height;
        if(obj.text)   text           = obj.text;
    }

    let memo = new BrowserWindow(options);

    memo.loadFile("./memo.html");
    memo.openDevTools();

    memoObj[memo.id + ""] = {window: memo};

    memo.on("closed", () => {
        memo = null;
    });

    memo.on("ready-to-show", (event) => {
        memo.show();
        saveObj[memo.id + ""] = {
            x: options.x,
            y: options.y,
            width: options.width,
            height: options.height,
            text: text
        };
    });
};

const saveFile = () => {
    let file = "./save.txt";
    let str  = JSON.stringify(saveObj);

    fs.writeFile(file, str, (err) => {
        if(err) {
            console.error(err);
        }
    });
}

app.on("ready", () => {
    init();

    ipcMain.on("MEMOINIT", (event, obj) => {
        console.log(obj);
        if(obj.id) {
            console.log(saveObj[obj.id]);
            if(saveObj[obj.id].text) {
                event.sender.send("MEMOINIT-reply", {id: obj.id, text: saveObj[obj.id].text});
            }
        }
    });

    ipcMain.on("New-Memo", (event, obj) => {
        createMemo();
    });

    ipcMain.on("SAVE_EXIT", (event, obj) => {
        console.log("SAVE_EXIT");
        for(let i in memoObj) {
            if(memoObj) {
                if(memoObj[i]) {
                    let memos    = memoObj[i].window;
                    let [ x, y ] = memos.getPosition();
                    let [ width, height ] = memos.getSize();

                    saveObj[i] = {x: x, y: y, width: width, height: height};
                }
            }
        }

        saveFile();
    });

    ipcMain.on("SAVE-TEXT", (event, obj) => {
        console.log(obj);
        if(obj) {
            if(obj.text) {
                console.log(obj.text);
                let thisId = obj.id + "";
                if(!saveObj[thisId]) saveObj[thisId] = {};
                console.log(saveObj);
                saveObj[thisId].text = obj.text;
                console.log(saveObj);
                saveFile();
            }
        }
    });

    ipcMain.on("SAVE-POSITION", (event, obj) => {

        if(obj) {
            saveObj[obj.id].x = obj.x;
            saveObj[obj.id].y = obj.y;

            saveFile();
        }
    });

    ipcMain.on("SAVE-SIZE", (event, obj) => {
        if(obj) {
            saveObj[obj.id].width  = obj.width;
            saveObj[obj.id].height = obj.height;

            saveFile();
        }
    });

    ipcMain.on("Close-Memo", (event, obj) => {
        console.log("Close-Memo - " + obj.idx);
        memoObj[obj.idx] = null;
        saveObj[obj.idx] = null;
        saveFile();
        event.sender.send("Close-Memo-Reply");
    });
});

app.on("all-closed", () => {
    app.quit();
});

app.on("activate", init);
