'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$http', '$window', '$log', '$upload', 'Authentication',
  function($resource, $http, $window, $log, $upload, Authentication) {
    var authentication = Authentication;

    // Define file resouce binding
    var rc = $resource('files/:filename', {
      filename: '@filename'
    }, {
      update: {
        method: 'PUT'
      }
    });

    // Define upload method
    this.upload = function(files, onprogress, onsuccess, onerror) {
      // Check input data
      if (!angular.isDefined(files) || files.length <= 0)
        return;

      // Upload each file
      files.forEach(function(file) {
        // Define progress callback
        function cbprogress(evt) {
          var perc = (evt.loaded / evt.total * 100).toFixed();
          $log.log('progress: ' + perc + '% ' + evt.config.file.name);
        }

        // Define success callback
        function cbsuccess(data, status, headers, config) {
          $log.info('%s is uploaded successfully.', config.file.name);
          if (onsuccess) {
            onsuccess(config);
          }
        }

        // Define error callback
        function cberror(err) {
          $log.error(err);
          if (onerror) {
            onerror(err);
          }
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
      function cbsuccess(data, getHeader) {
        if (onsuccess) {
          onsuccess(data);
        }
      }

      // Send request
      rc.query(cbsuccess);
    };

    // Define download method
    this.download = function(filenames, onsuccess, onerror) {
      // Check input data
      if (!angular.isDefined(filenames) || filenames.length <= 0)
        return;

      // Download each file
      filenames.forEach(function(filename) {
        // Define success callback
        function cbsuccess(data, status, headers, config) {
          if (data && onsuccess) {
            onsuccess(data, filename);
          }
        }

        // Define error callback
        function cberror(data, status, headers, config) {
          if (onerror) {
            onerror(status);
          }
        }

        // Send request
        $http.get('files/' + filename, {
            params: {
              level: 'full'
            }
          })
          .success(cbsuccess)
          .error(cberror);
      });
    };

    // Deinfe load method
    this.load = function(filenames, onprogress, onsuccess, onerror) {
      // Check input data
      if (!angular.isDefined(filenames) || filenames.length <= 0)
        return;

      // Load each file
      filenames.forEach(function(filename) {
        // Define progress callback
        function cbprogress(evt) {
          var total = req.getResponseHeader('ContentLength');
          var perc = (evt.loaded / total * 100).toFixed();
          $log.log('progress: ' + perc + '% ' + filename);
          if (onprogress) {
            onprogress(perc);
          }
        }

        // Define success callback
        function cbsuccess(evt) {
          // // Decrypt encrypted data
          // var raw = JSON.parse(req.responseText);
          // var params = $window.CryptoJS.lib.CipherParams.create({
          //   ciphertext: $window.CryptoJS.enc.Hex.parse(raw.ciphertext)
          // });
          // var salt = $window.CryptoJS.enc.Hex.parse(raw.salt);
          // var key = $window.CryptoJS.EvpKDF(authentication.user._id, salt, {
          //   keySize: 128 / 32
          // });
          // var iv = $window.CryptoJS.enc.Hex.parse(raw.iv);
          // var dec = $window.CryptoJS.AES.decrypt(params, key, {iv: iv, mode: $window.CryptoJS.mode.CBC});
          // var res = dec.toString($window.CryptoJS.enc.Utf8);
          $log.info('%s is loaded successfully.', filename);
          if (onsuccess) {
            onsuccess(req.response);
          }
        }

        // Define error callback
        function cberror(evt) {
          $log.error('Failed to load %s.', filenames);
          if (onerror) {
            onerror(evt);
          }
        }

        // Initialize XMLHttpRequest
        var req = new $window.XMLHttpRequest();

        // Add event listeners
        req.addEventListener('progress', cbprogress, false);
        req.addEventListener('load', cbsuccess, false);
        req.addEventListener('error', cberror, false);

        // Send request
        req.open('get', 'files/' + filename + '?level=display', true);
        req.send();
      });
    };

    // Define delete method
    this.delete = function(filenames, onsuccess, onerror) {
      var passed = [];
      var failed = [];

      // Delete each file
      filenames.forEach(function(filename) {
        // Define success callback
        function cbsuccess(value, getHeader) {
          passed.push(filename);
          $log.info('%s is deleted successfully.', filename);
          if (onsuccess) {
            onsuccess(passed);
          }
        }

        // Define error callback
        function cberror(value) {
          failed.push(filename);
          $log.error('Failed to delete %s!', filename);
          if (onerror) {
            onerror(failed);
          }
        }

        // Send request
        rc.delete({
          filename: filename
        }, cbsuccess, cberror);
      });
    };
  }
]);
