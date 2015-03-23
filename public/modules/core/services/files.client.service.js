'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$window',
  function($resource, $window) {
    // Define file resouce binding
    var rsc = $resource('files/:filename', {
      filename: '@filename'
    }, {
      update: {
        method: 'PUT'
      }
    });

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
        var res = req.responseText;
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