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
 * Encryption
 */
exports.encryptData = function(userId, data) {
  var salt = CryptoJS.lib.WordArray.random(128 / 8);
  var key = CryptoJS.EvpKDF(userId, salt, {
    keySize: 128 / 32
  });
  var iv = CryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
  var enc = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC
  });
  var raw = {
    iv: CryptoJS.enc.Hex.stringify(iv),
    salt: CryptoJS.enc.Hex.stringify(salt),
    ciphertext: CryptoJS.enc.Hex.stringify(enc.ciphertext)
  };
  return raw;
};

/**
 * Load a model file
 */
exports.loadVis = function(res, filepath, level) {
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
      var inp = fs.createReadStream(filepath);
      var out = unzip.Extract({
        path: systmp
      }).on('close', function() {
        // Read data from systmp
        var fdata, edata, udata, vdata, tdata, gd;
        if (typeof level === 'undefined' || level === 'display') {
          fdata = JSON.parse(fs.readFileSync(systmp + '/f'));
          edata = JSON.parse(fs.readFileSync(systmp + '/e'));

          // Construct gd (geometry descriptor)
          gd = {
            name: objname,
            faces: fdata,
            edges: edata
          };
        } else if (level === 'full') {
          fdata = JSON.parse(fs.readFileSync(systmp + '/f'));
          edata = JSON.parse(fs.readFileSync(systmp + '/e'));
          udata = JSON.parse(fs.readFileSync(systmp + '/u'));
          vdata = JSON.parse(fs.readFileSync(systmp + '/v'));
          tdata = JSON.parse(fs.readFileSync(systmp + '/t'));

          // Construct gd (geometry descriptor)
          gd = {
            name: objname,
            faces: fdata,
            edges: edata,
            uses: udata,
            vertices: vdata,
            topology: tdata
          };
        }
        fs.close(fd);

        // Send data
        // var msg = encryptData(res.req.user.id, gd); // encrype data
        var msg = JSON.stringify(gd);
        res.set('Content-Length', msg.length);
        res.send(msg).status(200).end();
      });
      inp.pipe(out);
    }
  });
};
