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
               return window.location.host + this.sharePath;
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
           } else {
               alert('Error from server: ' + result.error);
           }
       } catch (error) {
           alert('Error: ' + error.message);
       }
   }

   async process(uploadSpeed, downloadSpeed, ping) {
       if (this.isAnythingChanged(uploadSpeed, downloadSpeed, ping)) {
           await this.saveData(uploadSpeed, downloadSpeed, ping);
           this.lastData.upload = uploadSpeed;
           this.lastData.download = downloadSpeed;
           this.lastData.ping = ping;
       }
   }
}

const speedTestShare = new SpeedTestShare();

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

   speedTestShare.process(uploadSpeed, downloadSpeed, ping);
}