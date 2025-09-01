function updateTime() {
    const now = new Date();
    document.getElementById('localTime').textContent = now.toLocaleString();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
}

async function getIPAddress() {
    try {
        const response = await fetch('/api/ip');
        const data = await response.json();
        document.getElementById('ipAddress').textContent = data.ip || 'Not available';
        document.getElementById('ipAddress').classList.remove('loading');
    } catch (error) {
        document.getElementById('ipAddress').textContent = 'Download error';
        document.getElementById('ipAddress').classList.remove('loading');
    }
}

function loadUserInfo() {
    document.getElementById('userAgent').textContent = navigator.userAgent;
    document.getElementById('language').textContent = navigator.language;
    document.getElementById('cookiesEnabled').textContent = navigator.cookieEnabled ? 'Enabled' : 'Disabled';
    document.getElementById('platform').textContent = navigator.platform;

    document.getElementById('screenResolution').textContent = `${screen.width}x${screen.height}`;
    document.getElementById('availableScreen').textContent = `${screen.availWidth}x${screen.availHeight}`;
    document.getElementById('colorDepth').textContent = `${screen.colorDepth} бит`;
    document.getElementById('pixelRatio').textContent = window.devicePixelRatio || '1';

    document.getElementById('timezone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('hardwareConcurrency').textContent = navigator.hardwareConcurrency || 'Not available';

    if (navigator.onLine !== undefined) {
        document.getElementById('onlineStatus').textContent = navigator.onLine ? 'Online' : 'Offline';
        document.getElementById('onlineStatus').className = navigator.onLine ? 'info-value status-online' : 'info-value status-offline';
    }

    if (navigator.connection) {
        document.getElementById('connectionType').textContent = navigator.connection.type || 'Unknown';
        document.getElementById('effectiveType').textContent = navigator.connection.effectiveType || 'Unknown';
    }

    document.getElementById('localStorage').textContent = typeof(Storage) !== "undefined" ? 'Supported' : 'Not supported';
    document.getElementById('sessionStorage').textContent = typeof(Storage) !== "undefined" ? 'Supported' : 'Not supported';
    document.getElementById('indexedDB').textContent = typeof(window.indexedDB) !== "undefined" ? 'Supported' : 'Not supported';
    document.getElementById('webSQL').textContent = typeof(window.openDatabase) !== "undefined" ? 'Supported' : 'Not supported';

    if (navigator.geolocation) {
        document.getElementById('geolocationSupport').textContent = 'Supported';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('coordinates').textContent =
                    `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                document.getElementById('accuracy').textContent = `${position.coords.accuracy} м`;
            },
            (error) => {
                document.getElementById('coordinates').textContent = 'Access denied';
                document.getElementById('accuracy').textContent = 'Not available';
            }
        );
    } else {
        document.getElementById('geolocationSupport').textContent = 'Not supported';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    getIPAddress();
    updateTime();

    setInterval(updateTime, 1000);
    setTimeout(() => {
        document.getElementById('systemStatus').textContent = 'READY';
    }, 2000);
});

window.addEventListener('online', function() {
    document.getElementById('onlineStatus').textContent = 'Online';
    document.getElementById('onlineStatus').className = 'info-value status-online';
});

window.addEventListener('offline', function() {
    document.getElementById('onlineStatus').textContent = 'Offline';
    document.getElementById('onlineStatus').className = 'info-value status-offline';
});
