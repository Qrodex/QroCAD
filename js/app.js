//Check if QroCAD is running in desktop mode
function isElectron() {
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

//showOpenFilePicker polyfill for firefox
function showOpenFilePickerPolyfill(options) {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = options.multiple;
        input.accept = options.types
            .map((type) => type.accept)
            .flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]))
            .join(",");

        input.addEventListener("change", () => {
            resolve(
                [...input.files].map((file) => {
                    return {
                        getFile: async () =>
                            new Promise((resolve) => {
                                resolve(file);
                            }),
                    };
                })
            );
        });

        input.click();
    });
}
if (typeof window.showOpenFilePicker !== 'function') {
    window.showOpenFilePicker = showOpenFilePickerPolyfill
}

//input prompt for QroCAD Desktop
async function qroprompt(question) {
    if (isElectron()) {
        const prompt = require('electron-prompt');
        const answer = await prompt({
            title: 'QroCAD',
            label: question,
            value: '',
            type: 'input'
        })

        if (answer == null) {
            return ''
        } else {
            return answer
        }
    } else {
        return prompt(question)
    }
}

//copy text on click
function copy(that) {
    var inp = document.createElement('input');
    document.body.appendChild(inp)
    inp.value = that
    inp.select();
    document.execCommand('copy', false);
    inp.remove();
}


var versionspan = document.getElementById("spanversion")
async function setVersionManual() {
    const fetchpackage = await fetch("package.json")
    const packagejson = await fetchpackage.json()
    versionspan.innerText = (packagejson.version)
}

//main app
var gd
$(document).ready(function () {
    var things = ''
    let i = 0
    var loaderLoop = setInterval(function () {
        i++
        if (i < things.length) {
            try {
                document.getElementById("activationProgress").innerText = things[i]
            } catch (error) {
                clearInterval(loaderLoop)
            }
        } else {
            i = 0
        }
    }, 30)

    var loadingTime
    if (isElectron()) {
        loadingTime = 500
    } else {
        loadingTime = 3000
    }

    setTimeout(() => {
        $("#loader").fadeOut()
        var prevWidth = 0
        var prevHeight = 0
        function resizeCanvas() {
            let currWidth = (window.innerWidth - document.getElementById('sideButtons').getBoundingClientRect().width) - 1
            let currHeight = (window.innerHeight - document.getElementById('controls').getBoundingClientRect().height) - 1

            if ((currHeight != prevHeight) || (currWidth != prevWidth)) {
                prevWidth = currWidth
                prevHeight = currHeight

                gd.displayWidth = currWidth;
                gd.displayHeight = currHeight;
                document.getElementById("CADCanvas").width = currWidth;
                document.getElementById("CADCanvas").height = currHeight;
            }
        }

        function canvas2png() {
            let canvas = document.getElementById("CADCanvas");
            let url = canvas.toDataURL('image/png', 0.8);
            var element = document.createElement('a');
            element.setAttribute('download', 'image.png');

            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    element.href = blobUrl;
                    element.click();
                    URL.revokeObjectURL(blobUrl);
                })
                .catch(err => {
                    console.error('Failed to convert canvas to PNG:', err);
                });
        }
        $("#gd_png").click(canvas2png)

        gd = new GraphicDisplay("CADCanvas", 800, 600);
        resizeCanvas()
        setInterval(resizeCanvas, 10)
        gd.unitMeasure = "m";
        gd.unitConversionFactor = 1 / 100;
        gd.showOrigin = false;

        $("#gd_navigate").click(function () { gd.setMode(gd.MODES.NAVIGATE); });
        $("#gd_move").click(function () { gd.setMode(gd.MODES.MOVE); });
        $("#gd_edit").click(function () { gd.setMode(gd.MODES.EDIT); });
        $("#gd_delete").click(function () { gd.setMode(gd.MODES.DELETE); });

        $("#query_nav").click(function () { gd.setMode(gd.MODES.NAVIGATE); });
        $("#query_move").click(function () { gd.setMode(gd.MODES.MOVE); });
        $("#query_edit").click(function () { gd.setMode(gd.MODES.EDIT); });
        $("#query_delete").click(function () { gd.setMode(gd.MODES.DELETE); });

        $("#gd_zoomin").click(function () { gd.zoomIn(); });
        $("#gd_zoomout").click(function () { gd.zoomOut(); });

        $("#gd_addpoint").click(function () { gd.setMode(gd.MODES.ADDPOINT); });
        $("#gd_addline").click(function () { gd.setMode(gd.MODES.ADDLINE); });
        $("#gd_addcircle").click(function () { gd.setMode(gd.MODES.ADDCIRCLE); });
        $("#gd_addarc").click(function () { gd.setMode(gd.MODES.ADDARC); });
        $("#gd_addrectangle").click(function () { gd.setMode(gd.MODES.ADDRECTANGLE); });
        $("#gd_addmeasure").click(function () { gd.setMode(gd.MODES.ADDMEASURE); });
        $("#gd_addlabel").click(function () { gd.setMode(gd.MODES.ADDLABEL); });

        $("#query_addpoint").click(function () { gd.setMode(gd.MODES.ADDPOINT); });
        $("#query_addline").click(function () { gd.setMode(gd.MODES.ADDLINE); });
        $("#query_addcircle").click(function () { gd.setMode(gd.MODES.ADDCIRCLE); });
        $("#query_addarc").click(function () { gd.setMode(gd.MODES.ADDARC); });
        $("#query_addrect").click(function () { gd.setMode(gd.MODES.ADDRECTANGLE); });
        $("#query_addmeasure").click(function () { gd.setMode(gd.MODES.ADDMEASURE); });
        $("#query_addlabel").click(function () { gd.setMode(gd.MODES.ADDLABEL); });

        $("#gd_add_serbatoio_verticale").click(function () { gd.setModeShape(getShapeSerbatoioVerticale); });
        $("#gd_add_albero").click(function () { gd.setModeShape(getShapeAlbero); });

        $("#query_addvtank").click(function () { gd.setModeShape(getShapeSerbatoioVerticale); });
        $("#query_addtree").click(function () { gd.setModeShape(getShapeAlbero); });

        initCAD(gd);

        let undoStack = [];
        let redoStack = [];
        let lastArray = [...gd.logicDisplay.components];
        let fileHandle;
        function checkForChanges() {
            if (gd.logicDisplay.components.length !== lastArray.length || gd.logicDisplay.components.some((value, index) => value !== lastArray[index])) {
                if (!peerChange) {
                    undoStack.push([...lastArray]);
                    redoStack.length = 0;
                    lastArray = [...gd.logicDisplay.components];
                    sendCurrEditor()
                } else {
                    undoStack.push([...lastArray]);
                    redoStack.length = 0;
                    lastArray = [...gd.logicDisplay.components];
                    peerChange = false
                };
            }
        }
        setInterval(checkForChanges, 1000);

        function newProject() {
            fileHandle = undefined
            gd.logicDisplay.components = []
            if (!isElectron()) document.getElementById("gd_save").style.display = "none";
        }
        $("#gd_blank").click(newProject)
        $("#query_new").click(newProject)

        function undo() {
            if (undoStack.length > 0) {
                redoStack.push([...gd.logicDisplay.components]);
                gd.logicDisplay.components = undoStack.pop();
                lastArray = [...gd.logicDisplay.components];
            }
        }
        $("#gd_undo").click(undo);
        $("#query_undo").click(undo)

        function redo() {
            if (redoStack.length > 0) {
                undoStack.push([...gd.logicDisplay.components]);
                gd.logicDisplay.components = redoStack.pop();
                lastArray = [...gd.logicDisplay.components];
            }
        }
        $("#gd_redo").click(redo);
        $("#query_redo").click(redo)

        function downloadFile() {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(gd.logicDisplay.components)));
            element.setAttribute('download', 'project.qrocad');
            element.click();
        }
        $("#gd_download").click(downloadFile);

        async function openFile() {
            [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "QroCAD Project File",
                        accept: {
                            "qrocad/*": [".json", ".qrocad"],
                        },
                    },
                    {
                        description: "CompassCAD Design File",
                        accept: {
                            "ccad/*": [".ccad"],
                        },
                    },
                ],
                excludeAcceptAllOption: false,
                multiple: false,
            });
            const file = await fileHandle.getFile();
            const contents = await file.text();
            gd.logicDisplay.components = []
            gd.logicDisplay.importJSON(JSON.parse(contents), gd.logicDisplay.components)
            document.getElementById("gd_save").style.display = "block"
        }
        $("#gd_open").click(openFile);
        $("#query_open").click(openFile)

        async function saveFile() {
            if (fileHandle) {
                try {
                    const writable = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(gd.logicDisplay.components));
                    await writable.close();
                } catch (error) {
                    downloadFile()
                }
            } else {
                downloadFile()
            }
        }
        $("#gd_save").click(saveFile);

        function KeyPress(e) {
            var evtobj = window.event ? event : e
            if (evtobj.ctrlKey) {
                switch (evtobj.keyCode) {
                    case 90:
                        e.preventDefault()
                        undo()
                        break;
                    case 89:
                        e.preventDefault()
                        redo()
                        break;
                    case 83:
                        e.preventDefault()
                        saveFile()
                        break;
                    case 79:
                        e.preventDefault()
                        openFile()
                        break;
                    case 78:
                        e.preventDefault()
                        newProject()
                        break;
                }
            }
        }
        document.onkeydown = KeyPress;

        function searchstuff() {
            let input = document.getElementById('searchbar2').value
            input = input.toLowerCase();
            let x = document.getElementsByClassName('item-search');

            for (i = 0; i < x.length; i++) {
                if (!x[i].innerHTML.toLowerCase().includes(input)) {
                    x[i].style.display = "none";
                }
                else {
                    x[i].style.display = "list-item";
                }
            }
        }
        document.getElementById('searchbar2').oninput = searchstuff

        setInterval(function () {
            let input = document.getElementById('searchbar2').value
            if (!(input == null || input == "")) {
                document.getElementById("results").style.display = "block"
            } else {
                document.getElementById("results").style.display = "none"
            }
        }, 0)
    }, loadingTime);

    if (!isElectron()) {
        document.getElementById("closeApp").style.display = "none"
        document.getElementById("restoreApp").style.display = "none"
        document.getElementById("minimizeApp").style.display = "none"

        document.getElementById("results").style.marginRight = '6px'

        document.getElementById("extra-desktop").onclick = function () {
            open("https://github.com/Qrodex/QroCAD/releases", "_blank");
        }

        setVersionManual()
    } else {
        document.getElementById("extra-separator").style.display = "none"
        document.getElementById("extra-desktop").style.display = "none"
        document.getElementById("activationProgress").style.display = "none"
        document.getElementById("gd_save").style.display = "block"
        document.getElementById("gd_download").style.display = "none"

        const remote = require('@electron/remote')
        const app = remote.app
        const getWindow = () => remote.BrowserWindow.getFocusedWindow();
        const window = getWindow();
        var lastWindowState = 'win'

        versionspan.innerText = app.getVersion()

        function closeWindow() {
            getWindow().close();
        }

        function minimizeWindow() {
            getWindow().minimize();
        }

        function maximizeWindow() {
            const window = getWindow();
            window.isMaximized() ? window.unmaximize() : window.maximize();
        }

        setInterval(function () {
            if (window.isMaximized() & lastWindowState == 'win') {
                lastWindowState = 'max'
                document.getElementById("restoreApp").innerHTML = `<a class="dropbtn"><i class="icon icon-fw icon-chrome-restore"></i></a>`
            } else if (!window.isMaximized() & lastWindowState == 'max') {
                lastWindowState = 'win'
                document.getElementById("restoreApp").innerHTML = `<a class="dropbtn"><i class="icon icon-fw icon-chrome-maximize"></i></a>`
            }
        }, 0)

        document.getElementById("closeApp").onclick = closeWindow
        document.getElementById("restoreApp").onclick = maximizeWindow
        document.getElementById("minimizeApp").onclick = minimizeWindow
    }
});
