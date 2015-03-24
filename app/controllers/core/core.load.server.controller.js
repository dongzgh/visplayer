'use strict';

/**
 * Module dependencies.
 */
var os = require('os');
var path = require('path');
var fs = require('fs');
var unzip = require('unzip');
var CryptoJS = require('crypto-js');

/**
 * Load a model file
 */
exports.loadVis = function(res, filepath) {
  var filename = path.basename(filepath);
  var objname = filename.split('.')[0];
  var systmp = os.tmpdir() + '/' + objname;
  fs.open(filepath, 'r', function(err, fd) {
    if (err) {
      console.log(err);
    } else {
      // Unzip model file
      var inp = fs.createReadStream(filepath);
      var out = unzip.Extract({
        path: systmp
      }).on('close', function() {
        // Read data from systmp
        var fdata = JSON.parse(fs.readFileSync(systmp + '/f'));
        var edata = JSON.parse(fs.readFileSync(systmp + '/e'));
        fs.close(fd);

        // Construct default gd (geometry descriptor)
        var gd = {
          name: objname,
          faces: fdata,
          edges: edata
        };

        // Encrypt gd
        var enc = CryptoJS.AES.encrypt(JSON.stringify(gd), res.req.user.id);
        var raw = {
          key: CryptoJS.enc.Hex.stringify(enc.key),
          iv: CryptoJS.enc.Hex.stringify(enc.iv),
          salt: CryptoJS.enc.Hex.stringify(enc.salt),
          ciphertext: CryptoJS.enc.Hex.stringify(enc.ciphertext)
        };

        // Send data
        var msg = JSON.stringify(raw);
        res.set('ContentLength', msg.length);
        res.send(msg).status(200).end();
      });
      inp.pipe(out);
    }
  });
};