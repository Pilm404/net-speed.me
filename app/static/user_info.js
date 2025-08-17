// Update time
function updateTime() {
    const now = new Date();
    document.getElementById('localTime').textContent = now.toLocaleString();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
}

// Get IP address
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

// Load user information
function loadUserInfo() {
    // Browser info
    document.getElementById('userAgent').textContent = navigator.userAgent;
    document.getElementById('language').textContent = navigator.language;
    document.getElementById('cookiesEnabled').textContent = navigator.cookieEnabled ? 'Enabled' : 'Disabled';
    document.getElementById('platform').textContent = navigator.platform;

    // Screen info
    document.getElementById('screenResolution').textContent = `${screen.width}x${screen.height}`;
    document.getElementById('availableScreen').textContent = `${screen.availWidth}x${screen.availHeight}`;
    document.getElementById('colorDepth').textContent = `${screen.colorDepth} бит`;
    document.getElementById('pixelRatio').textContent = window.devicePixelRatio || '1';

    // System info
    document.getElementById('timezone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('hardwareConcurrency').textContent = navigator.hardwareConcurrency || 'Not available';

    // Network info
    if (navigator.onLine !== undefined) {
        document.getElementById('onlineStatus').textContent = navigator.onLine ? 'Online' : 'Offline';
        document.getElementById('onlineStatus').className = navigator.onLine ? 'info-value status-online' : 'info-value status-offline';
    }

    // Connection info
    if (navigator.connection) {
        document.getElementById('connectionType').textContent = navigator.connection.type || 'Unknown';
        document.getElementById('effectiveType').textContent = navigator.connection.effectiveType || 'Unknown';
    }

    // Storage support
    document.getElementById('localStorage').textContent = typeof(Storage) !== "undefined" ? 'Supported' : 'Not supported';
    document.getElementById('sessionStorage').textContent = typeof(Storage) !== "undefined" ? 'Supported' : 'Not supported';
    document.getElementById('indexedDB').textContent = typeof(window.indexedDB) !== "undefined" ? 'Supported' : 'Not supported';
    document.getElementById('webSQL').textContent = typeof(window.openDatabase) !== "undefined" ? 'Supported' : 'Not supported';

    // Geolocation
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    getIPAddress();
    updateTime();

    // Update time every second
    setInterval(updateTime, 1000);

    // Update system status after loading
    setTimeout(() => {
        document.getElementById('systemStatus').textContent = 'READY';
    }, 2000);
});

// Monitor online/offline status
window.addEventListener('online', function() {
    document.getElementById('onlineStatus').textContent = 'Online';
    document.getElementById('onlineStatus').className = 'info-value status-online';
});

window.addEventListener('offline', function() {
    document.getElementById('onlineStatus').textContent = 'Offline';
    document.getElementById('onlineStatus').className = 'info-value status-offline';
});