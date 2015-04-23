'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$window', '$log', '$upload', 'Authentication',
  function($resource, $window, $log, $upload, Authentication) {
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
    this.query = function(onsuccess) {
      rc.query(onsuccess);
    };

    // Deinfe load method
    this.load = function(filename, onprogress, onsuccess, onerror) {
      // Define progress callback
      function cbprogress(evt) {
        var total = req.getResponseHeader('ContentLength');
        var perc = (evt.loaded / total * 100).toFixed();
        $log.log('progress: ' + perc + '% ' + filename);
        onprogress(perc);
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
        onsuccess(req.response);
      }

      // Define error callback
      function cberror(evt) {
        $log.error('Failed to load %s.', filename);
        onerror(evt);
      }

      // Initialize XMLHttpRequest
      var req = new $window.XMLHttpRequest();

      // Add event listeners
      req.addEventListener('progress', cbprogress, false);
      req.addEventListener('load', cbsuccess, false);
      req.addEventListener('error', cberror, false);

      // Send request
      req.open('get', 'files/' + filename, true);
      req.send();
    };

    // Define delete method
    this.delete = function(filenames, onsuccess, onerror) {
      var i = 0;
      var passed = [];
      var failed = [];

      // Define success callback
      function cbsuccess(res) {
        passed.push(filenames[i]);
        $log.info('%s is deleted successfully.', filenames[i++]);
        if(i === filenames.length && onsuccess) {
          onsuccess(passed);
        }
      }

      // Define error callback
      function cberror(err) {
        failed.push(filenames[i]);
        $log.error('Failed to delete %s!', filenames[i++]);
        if(i === filenames.length && onerror) {
          onerror(failed);
        }
      }

      // Send request
      filenames.forEach(function(filename) {
        rc.delete({
          filename: filename
        }, cbsuccess, cberror);
      });
    };
  }
]);
