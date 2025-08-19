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

async function openInspector() {
    closeExplorer()

    inspectorMenu.style.transition = "all 0.1s ease";
    inspectorMenu.style.borderWidth = "1px";
    componentProperties.innerHTML = "";

    if (window.matchMedia('(pointer: none), (pointer: coarse)').matches) {
        inspectorMenu.style.bottom = document.getElementById("sidecontainer").getBoundingClientRect().height;
        inspectorMenu.style.width = "100vw";
        inspectorMenu.style.marginLeft = "0px";
        inspectorMenu.style.height = `calc(75dvh - ${document.getElementById("controls").getBoundingClientRect().height}px - ${document.getElementById("sidecontainer").getBoundingClientRect().height}px)`;
    } else {
        inspectorMenu.style.bottom = false;
        inspectorMenu.style.width = "25vw";
        inspectorMenu.style.marginLeft = document.getElementById("sidecontainer").getBoundingClientRect().width;
        inspectorMenu.style.height = `calc(100dvh - ${document.getElementById("controls").getBoundingClientRect().height}px)`;
    }

    var elemType = Object.keys(COMPONENT_TYPES).find(key => COMPONENT_TYPES[key] === gd.logicDisplay.components[gd.selectedComponent]["type"]);
    let title = document.createElement('h3');

    title.innerText = await translateOrLoadFromCache(`Editing: ${capitalizeString(elemType)}`, prefLang);
    componentProperties.prepend(title);

    setTimeout(async () => {
        inspectorMenu.style.transition = "none";
    }, 100);
}

function closeInspector() {
    componentProperties.innerHTML = "";

    if (window.matchMedia('(pointer: none), (pointer: coarse)').matches) {
        inspectorMenu.style.transition = "all 0.1s ease";
        inspectorMenu.style.height = "0dvh"
        inspectorMenu.style.borderWidth = "0px";
    } else {
        inspectorMenu.style.transition = "all 0.1s ease";
        inspectorMenu.style.width = "0vw"
        inspectorMenu.style.borderWidth = "0px";
    }

    setTimeout(() => { inspectorMenu.style.transition = "none"; }, 100);

    gd.unselectComponent();
}

function closeExplorer() {
    componentProperties.innerHTML = "";

    if (window.matchMedia('(pointer: none), (pointer: coarse)').matches) {
        explorerMenu.style.transition = "all 0.1s ease";
        explorerMenu.style.height = "0dvh"
        explorerMenu.style.borderWidth = "0px";
    } else {
        explorerMenu.style.transition = "all 0.1s ease";
        explorerMenu.style.width = "0vw"
        explorerMenu.style.borderWidth = "0px";
    }

    setTimeout(() => { explorerMenu.style.transition = "none"; }, 100);
}

setInterval(function () { })

function capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

//input prompt for QroCAD Desktop
async function qroprompt(question) {
    question = await translateOrLoadFromCache(question, prefLang);
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

var explorerMenu = document.getElementById("explorer")
var explorerList = document.getElementById("explorercontent")
var inspectorMenu = document.getElementById("inspector")
var componentProperties = document.getElementById("inspectorcontent")

var versionspan = document.getElementById("spanversion")
async function setVersionManual() {
    const fetchpackage = await fetch("package.json")
    const packagejson = await fetchpackage.json()
    versionspan.innerText = (packagejson.version)
}

function doInspectObject() {
    Object.entries(gd.logicDisplay.components[gd.selectedComponent]).forEach(async ([key, value]) => {
        if (key == "type") return;

        let input = document.createElement('input');
        let label = document.createElement('label');

        if (typeof value == 'number') {
            input.type = "number"

            input.oninput = async function (event) {
                gd.logicDisplay.components[gd.selectedComponent][key] = parseFloat(event.target.value);

                if (key == "radius") {
                    gd.previousRadius = parseFloat(event.target.value);
                }

                sendCurrEditor()
            };
        } else if (typeof value == 'string') {
            input.type = "text"

            input.oninput = async function (event) {
                gd.logicDisplay.components[gd.selectedComponent][key] = event.target.value;

                if (key == "color") {
                    gd.previousColor = event.target.value
                }

                sendCurrEditor()
            };
        } else if (typeof value == 'boolean') {
            input.type = "checkbox"
            input.checked = value

            input.oninput = async function (event) {
                gd.logicDisplay.components[gd.selectedComponent][key] = input.checked;
                sendCurrEditor()
            };
        }

        if (key == "color") {
            input.type = "color"
            input.value = gd.previousColor
        } else if (key == "radius") {
            input.type = "number"
            input.value = gd.previousRadius
        } else {
            input.value = value;
        }

        componentProperties.appendChild(label);
        if (typeof value != 'boolean') {
            componentProperties.appendChild(document.createElement('br'));
        }

        componentProperties.appendChild(input);
        componentProperties.appendChild(document.createElement('br'));
        label.innerText = await translateOrLoadFromCache(capitalizeString(key), prefLang) + ":";
    });
}

//main app
var gd
$(document).ready(function () {
    var loadingTime
    if (isElectron()) {
        loadingTime = 500
    } else {
        loadingTime = 3000
    }

    setTimeout(() => {
        $("#loader").fadeOut()
        startAutomaticTranslation()
        document.getElementById("languages").value = localStorage.getItem("prefLang") || "default";
        var prevWidth = 0
        var prevHeight = 0

        function resizeCanvas() {
            let sideButtonsWidth = document.getElementById('sideButtons').getBoundingClientRect().width
            let sideContainerHeight = document.getElementById('sidecontainer').getBoundingClientRect().height
            let controlsHeight = document.getElementById('controls').getBoundingClientRect().height
            let currWidth = window.innerWidth - (sideButtonsWidth + 2)
            let currHeight = window.innerHeight - (controlsHeight + 1)

            if (window.matchMedia('(pointer: none), (pointer: coarse)').matches) {
                currWidth = window.screen.width
                currHeight = window.screen.height - (controlsHeight + sideContainerHeight + 1)
            } else {
                document.getElementById("CADCanvas").style.marginTop = 0
            }

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

        $("#gd_navigate").click(function () { gd.setMode(gd.MODES.NAVIGATE); gd.cvn.css('cursor', 'grab'); });
        $("#gd_move").click(function () { gd.setMode(gd.MODES.MOVE); });
        $("#gd_edit").click(function () { gd.setMode(gd.MODES.EDIT); });
        $("#gd_delete").click(function () { gd.setMode(gd.MODES.DELETE); });

        $("#query_nav").click(function () { gd.setMode(gd.MODES.NAVIGATE); gd.cvn.css('cursor', 'grab'); });
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
        $("#gd_addimage").click(function () { gd.setMode(gd.MODES.ADDPICTURE); });

        $("#query_addpoint").click(function () { gd.setMode(gd.MODES.ADDPOINT); });
        $("#query_addline").click(function () { gd.setMode(gd.MODES.ADDLINE); });
        $("#query_addcircle").click(function () { gd.setMode(gd.MODES.ADDCIRCLE); });
        $("#query_addarc").click(function () { gd.setMode(gd.MODES.ADDARC); });
        $("#query_addrect").click(function () { gd.setMode(gd.MODES.ADDRECTANGLE); });
        $("#query_addmeasure").click(function () { gd.setMode(gd.MODES.ADDMEASURE); });
        $("#query_addlabel").click(function () { gd.setMode(gd.MODES.ADDLABEL); });
        $("#query_addimage").click(function () { gd.setMode(gd.MODES.ADDPICTURE); });

        $("#gd_add_serbatoio_verticale").click(function () { gd.setModeShape(getShapeSerbatoioVerticale); });
        $("#gd_add_albero").click(function () { gd.setModeShape(getShapeAlbero); });

        $("#query_addvtank").click(function () { gd.setModeShape(getShapeSerbatoioVerticale); });
        $("#query_addtree").click(function () { gd.setModeShape(getShapeAlbero); });

        initCAD(gd);
        gd.cvn.css('cursor', 'grab');

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
        setInterval(checkForChanges, 500);

        function newProject() {
            closeInspector()
            closeExplorer()
            fileHandle = undefined
            gd.logicDisplay.components = []
            if (!isElectron()) document.getElementById("gd_save").style.display = "none";
        }
        $("#gd_blank").click(newProject)
        $("#query_new").click(newProject)

        function openExplorer() {
            if (document.getElementById("inspector").style.width == '25vw' || (document.getElementById("inspector").style.height != '0dvh' && window.matchMedia('(pointer: none), (pointer: coarse)').matches)) {
                closeInspector()
            } else if (explorerMenu.style.width == "0vw" || explorerMenu.style.height == "0dvh") {
                explorerMenu.style.transition = "all 0.1s ease";
                explorerMenu.style.borderWidth = "1px";
                explorerList.innerHTML = "<h3>Explorer</h3>";

                if (window.matchMedia('(pointer: none), (pointer: coarse)').matches) {
                    explorerMenu.style.bottom = document.getElementById("sidecontainer").getBoundingClientRect().height;
                    explorerMenu.style.width = "100vw";
                    explorerMenu.style.marginLeft = "0px";
                    explorerMenu.style.height = `calc(75dvh - ${document.getElementById("controls").getBoundingClientRect().height}px - ${document.getElementById("sidecontainer").getBoundingClientRect().height}px)`;
                } else {
                    explorerMenu.style.bottom = false;
                    explorerMenu.style.width = "25vw";
                    explorerMenu.style.marginLeft = document.getElementById("sidecontainer").getBoundingClientRect().width;
                    explorerMenu.style.height = `calc(100dvh - ${document.getElementById("controls").getBoundingClientRect().height}px)`;
                }

                const explorercontent = document.getElementById("explorercontent")

                if (gd.logicDisplay.components.length == 0) {
                    explorercontent.innerHTML = "<h3>Explorer</h3>Add a component to the project to see it here!"
                }

                Object.keys(gd.logicDisplay.components).forEach(function (key, index) {
                    var component = gd.logicDisplay.components[key];
                    var button = document.createElement("input");
                    var elemType = Object.keys(COMPONENT_TYPES).find(key => COMPONENT_TYPES[key] === component.type);

                    button.className = "item-search";
                    button.type = "button";
                    button.value = `${capitalizeString(elemType)}`;
                    button.onclick = function () {
                        gd.selectComponent(key);
                        openInspector()
                        doInspectObject()
                    }

                    if (index > 0) {
                        explorercontent.appendChild(document.createElement("br"));
                        explorercontent.appendChild(document.createElement("br"));
                        explorercontent.appendChild(button);
                    } else {
                        explorercontent.appendChild(document.createElement("br"));
                        explorercontent.appendChild(button);
                    }
                })
            } else {
                closeExplorer()
            }
        }
        $("#gd_explorer").click(openExplorer)

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
                            "qrocad/*": [".json", ".qrocad", ".qrocad2"],
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
            closeInspector()
            closeExplorer()
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
        document.getElementById("gd_save").style.display = "block"
        document.getElementById("gd_download").style.display = "none"

        const remote = require('@electron/remote')
        const { ipcRenderer } = require('electron');
        const fs = require('fs');
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

        ipcRenderer.on('open-file', (event, filePath) => {
            var waitForLoad = setInterval(function () {
                if (gd) {
                    clearInterval(waitForLoad);
                    try {
                        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
                            const contents = fs.readFileSync(filePath, 'utf8');
                            const parsedData = JSON.parse(contents);
                            gd.logicDisplay.components = [];
                            gd.logicDisplay.importJSON(parsedData, gd.logicDisplay.components);
                            document.getElementById("gd_save").style.display = "block";
                            closeInspector();
                            closeExplorer();
                        } else {
                            console.log(`Error processing file: ${filePath} (File/Path not found)`);
                        }
                    } catch (error) {
                        console.log(`Error processing file: ${filePath}`, error);
                    }
                }
            })
        });

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
