'use strict';

/**
 * Module dependencies.
 */
var os = require('os');
var path = require('path');
var fs = require('fs');
var unzip = require('unzip');
var cryptoJS = require('crypto-js');

/**
 * Encryption
 */
exports.encryptData = function(userId, data) {
  var salt = cryptoJS.lib.WordArray.random(128 / 8);
  var key = cryptoJS.EvpKDF(userId, salt, {
    keySize: 128 / 32
  });
  var iv = cryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
  var enc = cryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: cryptoJS.mode.CBC
  });
  var raw = {
    iv: cryptoJS.enc.Hex.stringify(iv),
    salt: cryptoJS.enc.Hex.stringify(salt),
    ciphertext: cryptoJS.enc.Hex.stringify(enc.ciphertext)
  };
  return raw;
};

/**
 * Load a model file
 */
exports.loadVis = function(res, filepath) {
  // Get file information
  var filename = path.basename(filepath);
  var objname = filename.split('.')[0];
  var systmp = os.tmpdir() + '/' + objname;

  // Open file
  fs.open(filepath, 'r', function(err, fd) {
    if (err) {
      console.log(err);
    } else {
      // Unzip file
      var input = fs.createReadStream(filepath);
      var output = unzip.Extract({
        path: systmp
      }).on('close', function() {
        // Read data from systmp
        var tdata = JSON.parse(fs.readFileSync(systmp + '/t'));
        var sdata = JSON.parse(fs.readFileSync(systmp + '/s'));
        var cdata = JSON.parse(fs.readFileSync(systmp + '/c'));
        var pdata = JSON.parse(fs.readFileSync(systmp + '/p'));
        var mdata = JSON.parse(fs.readFileSync(systmp + '/m'));

        // Construct gd (geometry descriptor)
        var gd = {
          name: objname,
          topology: tdata,
          surfaces: sdata,
          curves: cdata,
          points: pdata,
          meshes: mdata
        };
        
        // Close file.
        fs.close(fd);

        // Send data
        // var msg = encryptData(res.req.user.id, gd); // encrype data
        var msg = JSON.stringify(gd);
        res.set('ContentLength', msg.length);
        res.send(msg).status(200).end();
      });
      input.pipe(output);
    }
  });
};
