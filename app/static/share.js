let sharePath = null;
let lastData1 = {
    upload: null,
    download: null,
    ping: null
}

function GetSharePath() {
    return sharePath;
}

function isAnythingChanged1(uploadSpeed, downloadSpeed, ping) {
    if (!sharePath) {
        return true;
    }
    if (lastData1.upload == uploadSpeed && lastData1.download == downloadSpeed && lastData1.ping == ping) {
        return false;
    }
    return true;
}

function initShare1() {
    const downloadElement = document.getElementById('downloadValue');
    const uploadElement = document.getElementById('uploadValue');
    const pingElement = document.getElementById('pingValue');

    if (!downloadElement || !uploadElement || !pingElement) {
        alert('Error: Can not find data');
        return;
    }

    const downloadSpeed = parseFloat(downloadElement.innerHTML);
    const uploadSpeed = parseFloat(uploadElement.innerHTML);
    const ping = parseInt(pingElement.innerHTML);

    if (isAnythingChanged1(uploadSpeed, downloadSpeed, ping)) {
        saveData1(uploadSpeed, downloadSpeed, ping);
        lastData1.upload = uploadSpeed;
        lastData1.download = downloadSpeed;
        lastData1.ping = ping;
    }
}

async function saveData1(uploadSpeed, downloadSpeed, ping) {
    const data = {
        upload: uploadSpeed,
        download: downloadSpeed,
        ping: ping
    };

    try {
        const response = await fetch('/api/share/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            sharePath = window.location.host + '/share/' + result.code;
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Error: ' + result.error);
    }
}
