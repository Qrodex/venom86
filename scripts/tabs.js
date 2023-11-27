function openTab(evt, tabname) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabname).style.display = "block";
    evt.currentTarget.className += " active";
}

function openvm(evt, tabname) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("vmtabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("vmtablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabname).style.display = "grid";
    evt.currentTarget.className += " active";
}

function openattr(evt, tabname) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("attrtabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("attrtablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabname).style.display = "grid";
    evt.currentTarget.className += " active";
}

function togglesidebar() {
    var r = document.querySelector(':root');
    var rs = getComputedStyle(r);
    x = rs.getPropertyValue('--sidebar-width');

    if (x == '20vw') {
        document.getElementById('togglesidebarbtn').innerHTML = `
            <i class="fa-regular fa-square-caret-right" aria-hidden="true"></i>
        `
        r.style.setProperty('--sidebar-transition', 'all 0.5s ease');
        r.style.setProperty('--sidebar-width', '0px');
        setTimeout(() => {
            r.style.setProperty('--sidebar-transition', 'none');
        }, 500);
    } else {
        document.getElementById('togglesidebarbtn').innerHTML = `
            <i class="fa-regular fa-square-caret-left" aria-hidden="true"></i>
        `

        r.style.setProperty('--sidebar-transition', 'all 0.5s ease');
        r.style.setProperty('--sidebar-width', '20vw');
        setTimeout(() => {
            r.style.setProperty('--sidebar-transition', 'none');
        }, 500);
    }
}