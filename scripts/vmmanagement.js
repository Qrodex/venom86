const fs = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile);
const remote = require('@electron/remote');
const app = remote.app;
const configDir = app.getPath('userData');
const { ipcRenderer } = require('electron');
document.getElementById('version').innerText = app.getVersion()
var myvms

async function fetchFileAsynchronously(filePath) {
    try {
        const data = await readFileAsync(filePath);
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}

if (fs.existsSync(configDir + '/myvms.json')) {
    console.log('VM List Found!')
} else {
    console.log('VM List Is Not Found! Creating VM List...')
    let jsontemplate = {
        "myvms": [
        ]
    };
    let data = JSON.stringify(jsontemplate, null, "\t");
    fs.writeFileSync(configDir + '/myvms.json', data);
}

async function filePickerDialog() {
    let result = await ipcRenderer.invoke('open-file-dialog')
    if (!result.canceled) {
        return result.filePaths[0]
    } else {
        return false
    }
}

async function fetchVMData() {
    let myvmsfetch = await fetch(configDir + '/myvms.json');
    let data = await myvmsfetch.json();
    myvms = data;
    loadvms();
}

function add(name, fda, fdb, cdrom, hda, hdb, ram, vram) {
    var obj = myvms;
    obj['myvms'].push({
        name: name,
        fda: fda,
        fdb: fdb,
        cdrom: cdrom,
        hda: hda,
        hdb: hdb,
        ram: ram,
        vram: vram
    });
    jsonStr = JSON.stringify(obj, null, "\t");
    fs.writeFile(configDir + '/myvms.json', jsonStr, (data, err) => {
        if (err) {
            console.log(err);
        }
        myvms = obj
        loadvms()
    });
};

function saveJSON() {
    jsonStr = JSON.stringify(myvms, null, "\t");
    fs.writeFile(configDir + '/myvms.json', jsonStr, (data, err) => {
        if (err) {
            console.log(err);
        }
        loadvms()
    });
}

function createForm() {
    add(
        'New Virtual Machine',
        false,
        false,
        false,
        false,
        false,
        32,
        32
    )
}

function loadvms() {
    document.getElementById('myvms').innerHTML = `
        <button class="qroui-button" onclick="createForm()">+ New VM</button>
    `
    myvms.myvms.forEach(async function (element, index) {
        let thiselem = element
        let mystorages = {}

        let vmbtn = document.createElement('button')
        vmbtn.className = 'qroui-button'
        vmbtn.innerHTML = thiselem.name

        vmbtn.onclick = async function (event) {
            document.getElementById('vmcontrols').innerHTML = ``
            document.getElementById('configleft').innerHTML = ``
            document.getElementById('configright').innerHTML = ``
            document.getElementById('drives').innerHTML = ``

            let delbtn = document.createElement('button')
            delbtn.innerText = 'Remove'
            delbtn.onclick = function () {
                myvms.myvms.splice(index, 1);
                saveJSON()
                document.getElementById('vmdetail').style.display = 'none'
            }
            document.getElementById('vmcontrols').appendChild(delbtn)

            let startbutton = document.createElement('button')
            startbutton.innerText = 'Start'
            startbutton.onclick = async function () {
                try {
                    if (thiselem.fda) {
                        mystorages.fda = await fetchFileAsynchronously(thiselem.fda)
                    } else if (thiselem.fdb) {
                        mystorages.fdb = await fetchFileAsynchronously(thiselem.fdb)
                    } else if (thiselem.hda) {
                        mystorages.hda = await fetchFileAsynchronously(thiselem.hda)
                    } else if (thiselem.hdb) {
                        mystorages.hdb = await fetchFileAsynchronously(thiselem.hdb)
                    } else if (thiselem.cdrom) {
                        mystorages.cdrom = await fetchFileAsynchronously(thiselem.cdrom)
                    }

                    init(
                        thiselem.name,
                        mystorages.fda,
                        mystorages.fdb,
                        mystorages.cdrom,
                        mystorages.hda,
                        mystorages.hdb,
                        thiselem.ram,
                        thiselem.vram
                    )
                } catch (error) {
                    window.alert(error)
                }
            }
            document.getElementById('vmcontrols').prepend(startbutton)

            //vm name
            let vmname = document.createElement('input')
            let fieldset = document.createElement('fieldset')
            fieldset.innerHTML = '<legend>Name</legend>'
            fieldset.appendChild(vmname)
            document.getElementById('configleft').appendChild(fieldset)
            vmname.value = thiselem.name
            vmname.onchange = function (e) {
                element.name = vmname.value
                saveJSON()
            }

            //ram
            let ramval = document.createElement('input')
            let ramfieldset = document.createElement('fieldset')
            ramval.type = 'number'
            ramfieldset.innerHTML = '<legend>Ram</legend>'
            ramfieldset.appendChild(ramval)
            document.getElementById('configright').appendChild(ramfieldset)
            ramval.value = thiselem.ram
            ramval.onchange = function (e) {
                element.ram = ramval.value
                saveJSON()
            }

            //vram
            let vramval = document.createElement('input')
            let vramfieldset = document.createElement('fieldset')
            vramval.type = 'number'
            vramfieldset.innerHTML = '<legend>Vram</legend>'
            vramfieldset.appendChild(vramval)
            document.getElementById('configright').appendChild(vramfieldset)
            vramval.value = thiselem.vram
            vramval.onchange = function (e) {
                element.vram = vramval.value
                saveJSON()
            }

            //hda
            let hdainput = document.createElement('input')
            let hdafieldset = document.createElement('fieldset')
            hdainput.readOnly = true
            hdafieldset.innerHTML = '<legend>HDA</legend>'
            hdafieldset.appendChild(hdainput)
            document.getElementById('drives').appendChild(hdafieldset)
            hdainput.value = thiselem.hda
            hdainput.onclick = async function (e) {
                element.hda = await filePickerDialog()
                hdainput.value = element.hda
                saveJSON()
            }

            //hdb
            let hdbinput = document.createElement('input')
            let hdbfieldset = document.createElement('fieldset')
            hdbinput.readOnly = true
            hdbfieldset.innerHTML = '<legend>HDB</legend>'
            hdbfieldset.appendChild(hdbinput)
            document.getElementById('drives').appendChild(hdbfieldset)
            hdbinput.value = thiselem.hdb
            hdbinput.onclick = async function (e) {
                element.hdb = await filePickerDialog()
                hdbinput.value = element.hdb
                saveJSON()
            }

            //fda
            let fdainput = document.createElement('input')
            let fdafieldset = document.createElement('fieldset')
            fdainput.readOnly = true
            fdafieldset.innerHTML = '<legend>FDA</legend>'
            fdafieldset.appendChild(fdainput)
            document.getElementById('drives').appendChild(fdafieldset)
            fdainput.value = thiselem.fda
            fdainput.onclick = async function (e) {
                element.fda = await filePickerDialog()
                fdainput.value = element.fda
                saveJSON()
            }

            //fdb
            let fdbinput = document.createElement('input')
            let fdbfieldset = document.createElement('fieldset')
            fdbinput.readOnly = true
            fdbfieldset.innerHTML = '<legend>FDB</legend>'
            fdbfieldset.appendChild(fdbinput)
            document.getElementById('drives').appendChild(fdbfieldset)
            fdbinput.value = thiselem.fdb
            fdbinput.onclick = async function (e) {
                element.fdb = await filePickerDialog()
                fdbinput.value = element.fdb
                saveJSON()
            }

            //cdrom
            let cdrominput = document.createElement('input')
            let cdromfieldset = document.createElement('fieldset')
            cdrominput.readOnly = true
            cdromfieldset.innerHTML = '<legend>CD-Rom</legend>'
            cdromfieldset.appendChild(cdrominput)
            document.getElementById('drives').appendChild(cdromfieldset)
            cdrominput.value = thiselem.cdrom
            cdrominput.onclick = async function (e) {
                element.cdrom = await filePickerDialog()
                cdrominput.value = element.cdrom
                saveJSON()
            }

            document.getElementById('vmdetail').style.display = 'block'
        }
        document.getElementById('myvms').appendChild(vmbtn)

        if (index == 0 && document.getElementById('configleft').innerHTML === "") {
            vmbtn.click()
        }
    });
}
fetchVMData()