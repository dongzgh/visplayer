'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$window', '$upload', 'Authentication',
  function($resource, $window, $upload, Authentication) {
    var authentication = Authentication;

    // Define file resouce binding
    var rsc = $resource('files/:filename', {
      filename: '@filename'
    }, {
      update: {
        method: 'PUT'
      }
    });

    // Define upload method
    this.upload = function(files, onprogress, onsuccess, onerror) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          $upload.upload({
            url: '/upload',
            file: file
          }).progress(onprogress).success(onsuccess).error(onerror);
        }
      }
    };

    // Define query method
    this.query = function(cb) {
      rsc.query(cb);
    };

    // Deinfe load method
    this.load = function(filename, onprogress, onsuccess, onerror) {
      // Initialize XMLHttpRequest
      var req = new $window.XMLHttpRequest();

      // Define progress callback
      function cbprogress(evt) {
        var total = req.getResponseHeader('ContentLength');
        onprogress(evt, total);
      }

      // Define success callback
      function cbsuccess(evt) {
        // Decrypt raw data
        var raw = JSON.parse(req.responseText);
        var params = $window.CryptoJS.lib.CipherParams.create({
          ciphertext: $window.CryptoJS.enc.Hex.parse(raw.ciphertext)
        });
        var salt = $window.CryptoJS.enc.Hex.parse(raw.salt);
        var key = $window.CryptoJS.EvpKDF(authentication.user._id, salt, {
          keySize: 128 / 32
        });
        var iv = $window.CryptoJS.enc.Hex.parse(raw.iv);
        var dec = $window.CryptoJS.AES.decrypt(params, key, {iv: iv, mode: $window.CryptoJS.mode.CBC});
        var res = dec.toString($window.CryptoJS.enc.Utf8);

        // Post-processing
        onsuccess(evt, res);
      }

      // Define error callback
      function cberror(evt) {
        onerror(evt);
      }

      // Add event listeners
      req.addEventListener('progress', cbprogress, false);
      req.addEventListener('load', cbsuccess, false);
      req.addEventListener('error', cberror, false);

      // Send request
      req.open('get', 'files/' + filename, true);
      req.send();
    };

    // Define delete method
    this.delete = function(filename, cb) {
      rsc.delete({
          filename: filename
        },
        function(res) {
          console.log('%s is deleted successfully.', filename);
          cb(filename);
        },
        function(err) {
          console.log('Failed to delete %s!', filename);
        });
    };
  }
]);
