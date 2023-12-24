const V86Starter = require('v86')

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

async function init(name, fda, fdb, cdrom, hda, hdb, ram, vram) {
    const v86Wasm = await fetchFileAsynchronously(app.getAppPath() + '/node_modules/v86/build/v86.wasm')
    const bios = await fetchFileAsynchronously(app.getAppPath() + '/node_modules/v86/bios/seabios.bin')
    const vgabios = await fetchFileAsynchronously(app.getAppPath() + '/node_modules/v86/bios/vgabios.bin')
    const tabID = makeid(256)
    const contID = makeid(256)

    let vmbtn = document.createElement('button')
    vmbtn.className = 'qroui-button vmtablinks'
    vmbtn.innerHTML = name + ' - Running...'
    vmbtn.onclick = function (event) {
        openvm(event, tabID)
    }
    document.getElementById('runningvms').appendChild(vmbtn)

    let preview = document.createElement('div')
    preview.className = `vmtabcontent`
    preview.id = tabID
    preview.innerHTML = `
        <container id="${contID}">
            <div style="white-space: pre; font: 14px monospace; line-height: 14px"></div>
            <canvas style="display: none"></canvas>
            <br>
        </container>
    `
    document.getElementById('previews').appendChild(preview)

    let controls = document.createElement('footer')
    controls.className = 'vmitem'
    document.getElementById(contID).appendChild(controls)

    DEBUG = false
    const vm = new V86Starter.V86Starter({
        wasm_fn: async (param) => (await WebAssembly.instantiate(await v86Wasm, param)).instance.exports,
        memory_size: ram * 1024 * 1024,
        vga_memory_size: vram * 1024 * 1024,
        screen_container: preview,
        bios: bios,
        vga_bios: vgabios,
        fda: fda,
        hda: hda,
        hdb: hdb,
        fdb: fdb,
        cdrom: cdrom,
        autostart: true,
    });
    console.log(vm)

    vm.add_listener("serial0-output-char", function(char) {
        document.getElementById("terminal").value += char;
        return
    })

    let stopvm
    let stopvmbtn = document.createElement('button')
    stopvmbtn.innerText = 'Stop'
    controls.appendChild(stopvmbtn)
    stopvmbtn.onclick = function () {
        stopvm = true
    }

    let restartbtn = document.createElement('button')
    restartbtn.innerText = 'Restart'
    controls.appendChild(restartbtn)
    restartbtn.onclick = function () {
        vm.restart()
    }

    let lockmousebtn = document.createElement('button')
    lockmousebtn.innerText = 'Lock mouse'
    controls.appendChild(lockmousebtn)
    lockmousebtn.onclick = function () {
        vm.lock_mouse()
    }

    let screenshotbtn = document.createElement('button')
    screenshotbtn.innerText = 'Screenshot'
    controls.appendChild(screenshotbtn)
    screenshotbtn.onclick = function () {
        vm.screen_make_screenshot()
    }

    let alttabbtn = document.createElement('button')
    alttabbtn.innerText = 'Send Alt+Tab'
    controls.appendChild(alttabbtn)
    alttabbtn.onclick = function (e) {
        vm.keyboard_send_scancodes([
            0x38 | 0x80,
            0x0F | 0x80,
        ]);
    }

    let cadbtn = document.createElement('button')
    cadbtn.innerText = 'Send Ctrl+Alt+Del'
    controls.appendChild(cadbtn)
    cadbtn.onclick = function (e) {
        vm.keyboard_send_scancodes([
            0x1D, // ctrl
            0x38, // alt
            0x53, // delete

            // break codes
            0x1D | 0x80,
            0x38 | 0x80,
            0x53 | 0x80,
        ]);
    }

    let scaleinput = document.createElement('input')
    scaleinput.value = 1.0
    scaleinput.type = 'number'
    scaleinput.step = 0.25
    controls.appendChild(scaleinput)
    scaleinput.onchange = function (e) {
        vm.screen_set_scale(scaleinput.value, scaleinput.value)
    }

    let vmloop
    vmloop = setInterval(async function () {
        if (stopvm == true) {
            clearInterval(vmloop)
            vmbtn.remove()
            preview.remove()

            if (document.getElementsByClassName("vmtablinks").length == 1) {
                document.getElementById('novm').style.display = 'grid'
            } else {
                document.getElementsByClassName("vmtablinks")[1].click()
            }

            await vm.destroy()
        } else {
            if (document.getElementById('myvmsbtn').classList.contains('active')) {
                if (!vmbtn.classList.contains('active')) {
                    vm.keyboard_adapter.emu_enabled = false
                } else if (vmbtn.classList.contains('active')) {
                    vm.keyboard_adapter.emu_enabled = true
                }
            } else {
                vm.keyboard_adapter.emu_enabled = false
            }
        }

        if (!vm.cpu_is_running) {
            stopvm = true
        }
    }, 1000)
    vmbtn.click()
    document.getElementById('myvmsbtn').click()
}