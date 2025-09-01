class SpeedTest {
    constructor() {
        this.isTestRunning = false;
        this.testResults = {
            ping: 0,
            download: 0,
            upload: 0
        };
    }

    async startTest() {
        if (this.isTestRunning) return;

        this.isTestRunning = true;
        this.updateUI('start');

        try {
            await this.testPing();

            await this.testDownload();

            await this.testUpload();

            this.updateUI('complete');
        } catch (error) {
            console.error('Ошибка при тестировании:', error);
            this.updateUI('error');
        }

        this.isTestRunning = false;
    }

    async testPing() {
        this.updateStatus('Измерение пинга...', '[PING_TEST]');

        const pingResults = [];
        const pingCount = 5;

        for (let i = 0; i < pingCount; i++) {
            const startTime = performance.now();

            try {
                await fetch('/api/ping', {
                    method: 'GET',
                    cache: 'no-cache'
                });

                const endTime = performance.now();
                const ping = endTime - startTime;
                pingResults.push(ping);

                const avgPing = Math.round(pingResults.reduce((a, b) => a + b, 0) / pingResults.length);
                document.getElementById('pingValue').textContent = avgPing;
                document.getElementById('pingProgress').style.width = ((i + 1) / pingCount * 100) + '%';

                await this.sleep(200);
            } catch (error) {
                console.error('Ошибка пинга:', error);
                pingResults.push(1000);
            }
        }

        pingResults.sort((a, b) => a - b);
        const trimmedResults = pingResults.slice(1, -1);
        this.testResults.ping = Math.round(trimmedResults.reduce((a, b) => a + b, 0) / trimmedResults.length);

        document.getElementById('pingValue').textContent = this.testResults.ping;
    }

    async testDownload() {
        this.updateStatus('Тест скачивания...', '[DOWNLOAD_TEST]');

        const downloadSizes = [16, 32];
        let totalBytes = 0;
        let totalTime = 0;

        for (const sizeMb of downloadSizes) {
            const startTime = performance.now();

            try {
                const response = await fetch(`/api/download?size_mb=${sizeMb}`, {
                    method: 'GET',
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body.getReader();
                let downloadedBytes = 0;

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    downloadedBytes += value.length;

                    const currentTime = performance.now();
                    const timeElapsed = (currentTime - startTime) / 1000;

                    if (timeElapsed > 0) {
                        const speedMbps = (downloadedBytes * 8) / (timeElapsed * 1000000);
                        document.getElementById('downloadValue').textContent = speedMbps.toFixed(2);

                        const progress = (downloadedBytes / (sizeMb * 1024 * 1024)) * 100;
                        document.getElementById('downloadProgress').style.width = Math.min(progress, 100) + '%';
                    }
                }

                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000;

                totalBytes += downloadedBytes;
                totalTime += duration;

            } catch (error) {
                console.error(`Ошибка при скачивании ${sizeMb}MB:`, error);
            }
        }

        if (totalTime > 0) {
            this.testResults.download = (totalBytes * 8) / (totalTime * 1000000);
            document.getElementById('downloadValue').textContent = this.testResults.download.toFixed(2);
        }
    }

    async testUpload() {
        this.updateStatus('Тест загрузки...', '[UPLOAD_TEST]');

        const uploadSizes = [8, 16];
        let totalBytes = 0;
        let totalTime = 0;

        for (const sizeMb of uploadSizes) {
            const data = new Uint8Array(sizeMb * 1024 * 1024);

            for (let i = 0; i < data.length; i++) {
                data[i] = Math.floor(Math.random() * 256);
            }

            const startTime = performance.now();

            try {
                const uploadProgress = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();

                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const currentTime = performance.now();
                            const timeElapsed = (currentTime - startTime) / 1000;

                            if (timeElapsed > 0) {
                                const speedMbps = (event.loaded * 8) / (timeElapsed * 1000000);
                                document.getElementById('uploadValue').textContent = speedMbps.toFixed(2);

                                const progress = (event.loaded / event.total) * 100;
                                document.getElementById('uploadProgress').style.width = progress + '%';
                            }
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(xhr.response);
                        } else {
                            reject(new Error(`HTTP error! status: ${xhr.status}`));
                        }
                    });

                    xhr.addEventListener('error', () => {
                        reject(new Error('Network error'));
                    });

                    xhr.open('POST', '/api/upload');
                    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                    xhr.send(data);
                });

                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000;

                totalBytes += data.length;
                totalTime += duration;

            } catch (error) {
                console.error(`Ошибка при загрузке ${sizeMb}MB:`, error);
            }
        }

        if (totalTime > 0) {
            this.testResults.upload = (totalBytes * 8) / (totalTime * 1000000);
            document.getElementById('uploadValue').textContent = this.testResults.upload.toFixed(2);
        }
    }

    updateUI(phase) {
        const button = document.querySelector('.speed-test-btn');
        const statusMain = document.getElementById('statusMain');
        const statusSub = document.getElementById('statusSub');

        switch (phase) {
            case 'start':
                button.innerHTML = '<svg class="play-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
                button.style.animation = 'spin 2s linear infinite';
                statusMain.textContent = 'Analyzing Network...';
                statusSub.textContent = '[PROCESSING...]';

                document.getElementById('downloadValue').textContent = '0.00';
                document.getElementById('uploadValue').textContent = '0.00';
                document.getElementById('pingValue').textContent = '0';
                document.getElementById('downloadProgress').style.width = '0%';
                document.getElementById('uploadProgress').style.width = '0%';
                document.getElementById('pingProgress').style.width = '0%';
                break;

            case 'complete':
                button.innerHTML = '<svg class="play-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
                button.style.animation = '';
                statusMain.textContent = 'Test Complete';
                statusSub.textContent = '[RESULTS_READY]';

                document.getElementById('downloadProgress').style.width = '100%';
                document.getElementById('uploadProgress').style.width = '100%';
                document.getElementById('pingProgress').style.width = '100%';

                setTimeout(() => {
                    statusMain.textContent = 'Initialize Speed Test';
                    statusSub.textContent = '[READY_FOR_EXECUTION]';
                }, 5000);
                break;

            case 'error':
                button.innerHTML = '<svg class="play-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
                button.style.animation = '';
                statusMain.textContent = 'Test Failed';
                statusSub.textContent = '[ERROR_OCCURRED]';

                setTimeout(() => {
                    statusMain.textContent = 'Initialize Speed Test';
                    statusSub.textContent = '[READY_FOR_EXECUTION]';
                }, 3000);
                break;
        }
    }

    updateStatus(main, sub) {
        document.getElementById('statusMain').textContent = main;
        document.getElementById('statusSub').textContent = sub;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const speedTest = new SpeedTest();

function startTest() {
    speedTest.startTest();
}

if (!document.querySelector('#speed-test-styles')) {
    const style = document.createElement('style');
    style.id = 'speed-test-styles';
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .stat-progress {
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}
