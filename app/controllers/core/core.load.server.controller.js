'use strict';

/**
 * Module dependencies.
 */
var os = require('os');
var path = require('path');
var fs = require('fs');
var unzip = require('unzip');

/**
 * Load a model file
 */
exports.loadVis = function(res, filepath) {
  var filename = path.basename(filepath);
  var objname = filename.split('.')[0];
  var tmppath = os.tmpdir() + '/' + objname;
  fs.open(filepath, 'r', function(err, fd) {
    if (err) {
      console.log(err);
    } else {
      // Unzip model file
      var inp = fs.createReadStream(filepath);
      var out = unzip.Extract({
        path: tmppath
      }).on('close', function() {
        var fpath = tmppath + '/f';
        var epath = tmppath + '/e';
        var fdata = JSON.parse(fs.readFileSync(fpath));
        var edata = JSON.parse(fs.readFileSync(epath));
        fs.close(fd);
        var gd = {
          name: objname,
          faces: fdata,
          edges: edata
        };
        console.log('Downloading vis data ...');
        res.send(gd).status(200).end();
      });
      inp.pipe(out);
    }
  });
};