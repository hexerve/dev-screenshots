var devices = [];
var url;

function getDevice(deviceName) {
    var currDevice = {};
    switch (deviceName) {
        case "small":
            currDevice.name = "small";
            currDevice.height = 360;
            currDevice.width = 480;
            break;

        case "medium":
            currDevice.name = "medium";
            currDevice.height = 480;
            currDevice.width = 640;
            break;

        default:
            currDevice = null;
    }
    return currDevice;
}

function add(deviceName) {
    var currDevice = getDevice(deviceName);
    devices.push(currDevice);
}

function remove(deviceName) {
    index = devices.findIndex(x => x.name === deviceName);
    if (index > -1) {
        devices.splice(index, 1);
    }
}

function handleChange(deviceName) {
    if (document.getElementById(deviceName).checked) {
        add(deviceName);
    } else {
        remove(deviceName);
    }
}

function filter() {
    temp = [];

    for (let i of devices)
        i && temp.push(i); // copy each non-empty value to the 'temp' array

    devices = temp;
    delete temp;
}

function validateURL() {
    url = document.getElementById("url").value;
    if (url === "") {
        return false;
    } else {
        return true;
    }
}

function submit() {
    document.getElementById("download").disabled = true;
    filter();
    if (devices.length === 0 || !validateURL()) {
        alert("Improper input");
    } else {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var filename = JSON.parse(this.response).results.filename
                document.getElementById("download").setAttribute("onclick",
                    "window.open('download/" + filename + "','_self')");
                document.getElementById("download").disabled = false;
                alert("Your file is ready click to download");
            }
        };
        xmlhttp.open("POST", "../");
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify({
            "devices": devices,
            "url": url
        }));
    }
}