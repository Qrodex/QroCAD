//generate p2p id
var conn
var peerChange = false
var peer = new Peer();

peer.on('open', function (id) {
    var idButton = document.getElementById("myID")
    idButton.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> ${id}`

    idButton.onclick = function () {
        copy(id)
        idButton.innerHTML = `<i class="fa-solid fa-clipboard-check"></i> ${id}`
        setTimeout(() => {
            idButton.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> ${id}`
        }, 1000);
    }
});

peer.on('connection', function (c) {
    conn = c;

    conn.on('open', function () {
        conn.on('data', function (data) {
            if (data.type === 'handshake') {
                const autoConn = peer.connect(data.peerId);
                autoConn.on('open', function () {
                    autoConn.on('data', function (data) {
                        updateEditor(data);
                    });
                    conn = autoConn;
                });
            } else {
                updateEditor(data);
            }
        });
    });
});

//update editor
function updateEditor(content) {
    var backup = JSON.stringify(gd.logicDisplay.components)
    gd.logicDisplay.components = []
    peerChange = true

    try {
        gd.logicDisplay.importJSON(JSON.parse(content), gd.logicDisplay.components)
    } catch (error) {
        console.error(error)
        gd.logicDisplay.importJSON(JSON.parse(backup), gd.logicDisplay.components)
    }
}

//experimental collaborative editing with peer.js
async function startCollab() {
    if (conn && conn.open) return;

    conn = peer.connect(await qroprompt("Enter Peer ID"));
    conn.on('open', function () {
        conn.send({ type: 'handshake', peerId: peer.id });
        conn.on('data', function (data) {
            updateEditor(data);
        });
    });
}

//send current editor
function sendCurrEditor() {
    if (conn && conn.open) {
        conn.send(JSON.stringify(gd.logicDisplay.components));
    }
}

//hide connect button when connected
setInterval(() => {
    if (conn && conn.open) {
        document.getElementById("connectbtn").style.display = 'none'
        document.getElementById("connected").style.display = 'block'
    } else {
        document.getElementById("connectbtn").style.display = 'block'
        document.getElementById("connected").style.display = 'none'
    }
});