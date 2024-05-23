var gd
$(document).ready(function () {
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

    gd = new GraphicDisplay("CADCanvas", 800, 600);
    resizeCanvas()
    setInterval(resizeCanvas, 10)
    gd.unitMeasure = "m";
    gd.unitConversionFactor = 1 / 100;
    gd.showOrigin = false;

    $("#gd_blank").click(function () { gd.logicDisplay.components = [] })

    $("#gd_navigate").click(function () { gd.setMode(gd.MODES.NAVIGATE); });
    $("#gd_move").click(function () { gd.setMode(gd.MODES.MOVE); });
    $("#gd_edit").click(function () { gd.setMode(gd.MODES.EDIT); });
    $("#gd_delete").click(function () { gd.setMode(gd.MODES.DELETE); });

    $("#gd_zoomin").click(function () { gd.zoomIn(); });
    $("#gd_zoomout").click(function () { gd.zoomOut(); });

    $("#gd_addpoint").click(function () { gd.setMode(gd.MODES.ADDPOINT); });
    $("#gd_addline").click(function () { gd.setMode(gd.MODES.ADDLINE); });
    $("#gd_addcircle").click(function () { gd.setMode(gd.MODES.ADDCIRCLE); });
    $("#gd_addarc").click(function () { gd.setMode(gd.MODES.ADDARC); });
    $("#gd_addrectangle").click(function () { gd.setMode(gd.MODES.ADDRECTANGLE); });
    $("#gd_addmeasure").click(function () { gd.setMode(gd.MODES.ADDMEASURE); });
    $("#gd_addlabel").click(function () { gd.setMode(gd.MODES.ADDLABEL); });

    $("#gd_add_serbatoio_verticale").click(function () { gd.setModeShape(getShapeSerbatoioVerticale); });
    $("#gd_add_albero").click(function () { gd.setModeShape(getShapeAlbero); });

    initCAD(gd);

    let undoStack = [];
    let redoStack = [];
    let lastArray = [...gd.logicDisplay.components];
    function checkForChanges() {
        if (gd.logicDisplay.components.length !== lastArray.length || gd.logicDisplay.components.some((value, index) => value !== lastArray[index])) {
            undoStack.push([...lastArray]);
            redoStack.length = 0;
            lastArray = [...gd.logicDisplay.components];
        }
    }
    setInterval(checkForChanges, 1000);

    function undo() {
        if (undoStack.length > 0) {
            redoStack.push([...gd.logicDisplay.components]);
            gd.logicDisplay.components = undoStack.pop();
            lastArray = [...gd.logicDisplay.components];
        }
    }
    $("#gd_undo").click(undo);

    function redo() {
        if (redoStack.length > 0) {
            undoStack.push([...gd.logicDisplay.components]);
            gd.logicDisplay.components = redoStack.pop();
            lastArray = [...gd.logicDisplay.components];
        }
    }
    $("#gd_redo").click(redo);

    let fileHandle;

    document.getElementById('gd_open').addEventListener('click', async () => {
        [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const contents = await file.text();
        gd.logicDisplay.components = []
        gd.logicDisplay.importJSON(JSON.parse(contents), gd.logicDisplay.components)
    });

    document.getElementById('gd_save').addEventListener('click', async () => {
        if (fileHandle) {
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(gd.logicDisplay.components));
            await writable.close();
        }
    });
});