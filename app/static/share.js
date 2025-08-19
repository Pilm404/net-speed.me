class SpeedTestShare {
    constructor() {
        this.sharePath = null;
        this.lastData = {
            upload: null,
            download: null,
            ping: null
        };
    }

    async getSharePath() {
        if (!this.sharePath) {
            return null;
        }

        const code = this.sharePath.split('/').pop();

        try {
            const response = await fetch(`/api/share/status/${code}`, {
                method: 'POST'
            });
            const result = await response.json();

            if (result.available === true) {
                return this.sharePath;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    isAnythingChanged(uploadSpeed, downloadSpeed, ping) {
        if (!this.sharePath) {
            return true;
        }
        if (this.lastData.upload == uploadSpeed &&
            this.lastData.download == downloadSpeed &&
            this.lastData.ping == ping) {
            return false;
        }
        return true;
    }

    async saveData(uploadSpeed, downloadSpeed, ping) {
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
                this.sharePath = '/share/' + result.code;
                ShowSuccess(`<a href="${this.sharePath}" style="color: white">Click here to open your results</a>`);
            } else {
                ShowError('Error from server: ' + result.error);
            }
        } catch (error) {
            ShowError('Error: ' + error.message);
        }
    }

    async process(uploadSpeed, downloadSpeed, ping) {
        if (this.isAnythingChanged(uploadSpeed, downloadSpeed, ping)) {
            await this.saveData(uploadSpeed, downloadSpeed, ping);
            this.lastData.upload = uploadSpeed;
            this.lastData.download = downloadSpeed;
            this.lastData.ping = ping;
        }
        else
        {
            if (await speedTestShare.getSharePath()) {
                ShowSuccess(`<a href="${await speedTestShare.getSharePath()}" style="color: white">Click here to open your results</a>`);
            } else {
                ShowError("Error: You have removed the link");
                this.sharePath = null;
            }
        }
    }
}

function ShowError(message) {
    Toastify({
        text: `<div class="toast-content">
            <span class="toast-icon">❌</span>
            <span>${message}</span>
    </div>`,
        duration: 5000,
        close: true,
        gravity: "top",
        position: "left",
        escapeMarkup: false,
        style: {
            background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
            color: "#ffffff",
            border: "1px solid #f44336",
            borderRadius: "8px"
        }
    }).showToast();
}

function ShowSuccess(message) {
    Toastify({
        text: `<div class="toast-content">
        <span class="toast-icon">✅</span>
        <span>${message}</span>
    </div>`,
        duration: 5000,
        close: true,
        gravity: "top",
        position: "left",
        escapeMarkup: false,
        style: {
            background: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)",
            color: "#ffffff",
            border: "1px solid #444",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
        }
    }).showToast();
}

const speedTestShare = new SpeedTestShare();

function initShare1() {
    const downloadElement = document.getElementById('downloadValue');
    const uploadElement = document.getElementById('uploadValue');
    const pingElement = document.getElementById('pingValue');

    if (!downloadElement || !uploadElement || !pingElement) {
        ShowError('Error: Can not find data');
        return;
    }

    const downloadSpeed = parseFloat(downloadElement.innerHTML);
    const uploadSpeed = parseFloat(uploadElement.innerHTML);
    const ping = parseInt(pingElement.innerHTML);

    speedTestShare.process(uploadSpeed, downloadSpeed, ping);
}