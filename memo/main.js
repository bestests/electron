const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const fs = require("fs");

let mainWin;
let tray;
const memoObj = {};
var saveObj = {};

const Memo = function (x = 810, y=375, width=300, heigth=300, text="") {
    this.x               = x;
    this.y               = y;
    this.width           = width;
    this.height          = heigth;
    this.text            = text;
    this.backgroundColor = "#ffff00",
    this.frame           = false,
    this.show            = false

    return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        text : this.text,
        backgroundColor: this.backgroundColor,
        frame: this.frame,
        show: this.show
    };
};

const randomStr = () => {

    let toDate = new Date();

    let year  = toDate.getFullYear().toString();
    let month = twoLen((toDate.getMonth() + 1).toString());
    let date  = twoLen(toDate.getDate().toString());
    let hour  = twoLen(toDate.getHours().toString());
    let min   = twoLen(toDate.getMinutes().toString());
    let sec   = twoLen(toDate.getSeconds().toString());
    let mil   = twoLen(toDate.getMilliseconds().toString());

    let dateStr = year + month + date + hour + min + sec + mil;

    return dateStr + "_" + (Math.random().toString(36).slice(2).toUpperCase());
};

const twoLen = (str) => {
    return str.length < 2 ? "0" + str : str;
};

const init = () => {

    let isNew = true;

    mainWin = new BrowserWindow({width:800, height: 600, show: false});

    mainWin.loadFile("./main.html");
//    mainWin.show();

    fs.access("./save.txt", fs.constants.R_OK, (err) => {
        if(err) {
            if(err.code === "ENOENT") {
                saveFile();
                createMemo();
            }
        } else {

            let fileData = fs.readFileSync("./save.txt", (err) => {
                if(err) {
                    console.error(err);
                }
            }).toString();

            new Promise((resolve, reject) => {
                if(fileData) {

                    var saveObj = JSON.parse(fileData);

                    if(saveObj && Object.keys(saveObj).length > 0) {
                        resolve(saveObj);
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            }).then(saveObj => {

                let isNew = true;

                for(let i in saveObj) {

                    let saveMemo = saveObj[i];

                    if(saveMemo) {

                        let { x, y, width, height, text } = saveMemo;

                        createMemo({x: x, y:y, width: width, height: height, text: text});

                        isNew = false;

                    } else {

                        if(isNew) createMemo();

                        isNew = false;
                    }
                }

                if(isNew) createMemo();

            }).catch(() => {
                createMemo();
            });
        }
    });
};

const createMemo = (obj) => {

    let options;

    if(obj) {
        options = new Memo(obj.x, obj.y, obj.width, obj.height, obj.text);
    } else {
        options = new Memo();
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
            text: options.text,
            fileArr: []
        };
    });
};

const saveFile = () => {
    let file = "./save.txt";
    let str  = JSON.stringify(saveObj);

    fs.writeFileSync(file, str, (err) => {
        if(err) {
            console.error(err);
        }
    });
}

const copyFile = (id, filePath) => {

    var file = "./save/";
    let str = randomStr();
    let oriFileNm = "";
    let reFileNm = "";
    let fileExt = "";

    fs.access(file, fs.constants.F_OK | fs.constants.W_OK, (err) => {

        let folderChk = false;
        
        if(err) {
            if(err.code === "ENOENT") {
                console.log("file : " + file);
                fs.mkdirSync(file);

                folderChk = true;
            }
            console.log(err);
        } else {
            folderChk = true;
        }

        if(folderChk) {
            console.log("filePath : " + filePath);

            oriFileNm = filePath.substr(filePath.lastIndexOf("\\") + 1, filePath.length);
            fileExt   = oriFileNm.substr(oriFileNm.lastIndexOf(".") + 1, oriFileNm.length).toLowerCase();
            reFileNm  = str + "." + fileExt;

            file += reFileNm;

            console.log(file);

            fs.copyFile(filePath, file, (err) => {
                if(err) {
                    console.log(err);
                } else {
                    saveObj[id].fileArr.push({
                        oriFileNm: oriFileNm,
                        reFileNm: reFileNm,
                        fileExt: fileExt
                    });
                }
            });
        }
    });

    return {
        oriFileNm: oriFileNm,
        reFileNm: reFileNm
    };
};

app.on("ready", () => {

    init();

    tray = new Tray("./images/sticky.ico");

    const trayMenu = Menu.buildFromTemplate([
        {label: "New Memo", click: () => {
            createMemo();
        }},
        {label: "Quit", click: () => {
            saveFile();
            app.quit();
        }}
    ]);

    tray.setToolTip("Memo");
    tray.setContextMenu(trayMenu);

    ipcMain.on("MEMOINIT", (event, obj) => {
        
        if(obj.id) {
            
            if(saveObj[obj.id].text) {
                event.sender.send("MEMOINIT-reply", {id: obj.id, text: saveObj[obj.id].text});
            }
        }
    });

    ipcMain.on("New-Memo", (event, obj) => {
        createMemo();
    });

    ipcMain.on("SAVE_EXIT", (event, obj) => {
      
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
        
        if(obj) {
            if(obj.text) {
                
                let thisId = obj.id + "";
                if(!saveObj[thisId]) saveObj[thisId] = {};
                
                saveObj[thisId].text = obj.text;
                
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

    ipcMain.on("UPLOAD-FILE", (event, obj) => {
        if(obj) {
            if(obj.fileArr) {
                for(let filePath of obj.fileArr) {
                   copyFile(obj.id, filePath);
                }
            }
        }
        saveFile();
    });

    ipcMain.on("Close-Memo", (event, obj) => {
        
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
