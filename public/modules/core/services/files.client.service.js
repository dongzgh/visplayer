'use strict';

// Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$http', '$window', '$log', '$upload', 'Authentication', 
  function($resource, $http, $window, $log, $upload, Authentication) {
    var authentication = Authentication;

    // Define file resouce binding
    var rc = $resource('files/:fileName', {
      fileName: '@fileName'
    }, {
      update: {
        method: 'PUT'
      }
    });

    // Decrypt encrypted data
    this.decryptData = function(data, userId) {
      var raw = JSON.parse(data);
      var params = $window.CryptoJS.lib.CipherParams.create({
        ciphertext: $window.CryptoJS.enc.Hex.parse(raw.ciphertext)
      });
      var salt = $window.CryptoJS.enc.Hex.parse(raw.salt);
      var key = $window.CryptoJS.EvpKDF(userId, salt, {
        keySize: 128 / 32
      });
      var iv = $window.CryptoJS.enc.Hex.parse(raw.iv);
      var dec = $window.CryptoJS.AES.decrypt(params, key, {
        iv: iv,
        mode: $window.CryptoJS.mode.CBC
      });
      var res = dec.toString($window.CryptoJS.enc.Utf8);
    };

    // Define upload method
    this.upload = function(files, onprogress, onsuccess, onerror, onfinal) {
      // Check input data
      if (typeof files === 'undefined' || files.length <= 0) return;

      // Upload each file
      var passed = [];
      var failed = [];
      files.forEach(function(file, index) {
        // Define progress callback
        function cbprogress(update) {
          var progress = (update.loaded / update.total * 100).toFixed();
          $log.log('progress: ' + progress + '% ' + update.config.file.name);
          if (onprogress) onprogress(progress);
        }

        // Define success callback
        function cbsuccess(data, status, getHeaders, config) {
          passed.push(config.file.name);
          $log.info('%s is uploaded successfully.', config.file.name);
          if (onsuccess) onsuccess(config);
          cbfinal();
        }

        // Define error callback
        function cberror(data, status, getHeaders, config) {
          failed.push(config.file.name);
          $log.error('Failed to upload %s.', config.file.name);
          if (onerror) onerror(config);
          cbfinal();
        }

        // Define final callback
        function cbfinal() {
          if (index === files.length - 1 && onfinal) onfinal(passed, failed);
        }

        // Send request
        $upload.upload({
          url: '/upload',
          file: file
        }).progress(cbprogress).success(cbsuccess).error(cberror);
      });
    };

    // Define query method
    this.list = function(onsuccess) {
      // Define success callback
      function cbsuccess(data, getHeaders) {
        if (onsuccess) onsuccess(data);
      }

      // Send request
      rc.query(cbsuccess);
    };

    // Define download method
    this.download = function(fileNames, onsuccess, onerror) {
      // Check input data
      if (typeof fileNames === 'undefined' || fileNames.length <= 0) return;

      // Download each file
      fileNames.forEach(function(fileName) {
        // Define success callback
        function cbsuccess(data, status, getHeaders, config) {
          if (data && onsuccess) onsuccess(data, fileName);
        }

        // Define error callback
        function cberror(data, status, getHeaders, config) {
          if (onerror) onerror(status);
        }

        // Send request
        var url = 'files/' + fileName;
        $http.get(url, {
            params: {
              mode: 'download'
            },
            responseType: 'blob'
          })
          .success(cbsuccess)
          .error(cberror);
      });
    };

    // Deinfe load method
    this.load = function(fileNames, onprogress, onsuccess, onerror) {
      // Check input data
      if (typeof fileNames === 'undefined' || fileNames.length <= 0) return;

      // Load each file
      fileNames.forEach(function(fileName) {
        // Define progress callback
        function cbprogress(evt) {
          var total = req.getResponseHeader('ContentLength');
          var progress = (evt.loaded / total * 100).toFixed();
          $log.log('progress: ' + progress + '% ' + fileName);
          if (onprogress) onprogress(progress);
        }

        // Define success callback
        function cbsuccess(evt) {
          // // Decrypt encrypted data
          //decryptData(req.responseText, authentication.user._id);
          $log.info('%s is loaded successfully.', fileName);
          if (onsuccess) onsuccess(req.response);
        }

        // Define error callback
        function cberror(evt) {
          $log.error('Failed to load %s.', fileNames);
          if (onerror) onerror(evt);
        }

        // Initialize XMLHttpRequest
        var req = new $window.XMLHttpRequest();

        // Add event listeners
        req.addEventListener('progress', cbprogress, false);
        req.addEventListener('load', cbsuccess, false);
        req.addEventListener('error', cberror, false);

        // Send request
        req.open('get', 'files/' + fileName, true);
        req.send();
      });
    };

    // Define delete method
    this.delete = function(fileNames, onsuccess, onerror) {
      // Check input data
      if (typeof fileNames === 'undefined' || fileNames.length <= 0) return;

      // Delete each file
      fileNames.forEach(function(fileName) {
        // Define success callback
        function cbsuccess(data, getHeader) {
          $log.info('%s is deleted successfully.', fileName);
          if (onsuccess) onsuccess(fileName);
        }

        // Define error callback
        function cberror(data) {
          $log.error('Failed to delete %s!', fileName);
          if (onerror) onerror(fileName);
        }

        // Send request
        rc.delete({
          fileName: fileName
        }, cbsuccess, cberror);
      });
    };
  }
]);
