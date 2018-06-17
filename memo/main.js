const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");

let mainWin;
const memoObj = {};
var saveObj = {};

const init = () => {

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
                let { x, y, width, height } = saveMemo;

                createMemo({x: x, y:y, width: width, height: height});
            }
        }
    } else {
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

    if(obj) {
        if(obj.x) options.x = obj.x;
        if(obj.y) options.y = obj.y;
        if(obj.width) options.width = obj.width;
        if(obj.height) options.height = obj.height;
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
    });
};

app.on("ready", () => {
    init();

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

        let file = "./save.txt";
        let str  = JSON.stringify(saveObj);

        fs.writeFile(file, str, (err) => {
            if(err) {
                console.error(err);
            }
        });


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
            }
        }
    });

    ipcMain.on("Close-Memo", (event, obj) => {
        console.log("Close-Memo - " + obj.idx);
        memoObj[obj.idx] = null;
        event.sender.send("Close-Memo-Reply");
    });
});

app.on("all-closed", () => {
    app.quit();
});

app.on("activate", init);