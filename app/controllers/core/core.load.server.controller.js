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
      var input = fs.createReadStream(filepath);
      var output = unzip.Extract({
        path: systmp
      }).on('close', function() {
        // Read data from systmp
        var tdata, sdata, cdata, pdata, mdata, gd
        if (typeof level === 'undefined' || level === 'display') {          
          cdata = JSON.parse(fs.readFileSync(systmp + '/c'));
          pdata = JSON.parse(fs.readFileSync(systmp + '/p'));
          mdata = JSON.parse(fs.readFileSync(systmp + '/m'));

          // Construct gd (geometry descriptor)
          gd = {
            name: objname,
            curves: cdata,
            points: pdata,
            meshes: mdata            
          };
        } else if (level === 'full') {
          tdata = JSON.parse(fs.readFileSync(systmp + '/t'));
          sdata = JSON.parse(fs.readFileSync(systmp + '/s'));
          cdata = JSON.parse(fs.readFileSync(systmp + '/c'));
          pdata = JSON.parse(fs.readFileSync(systmp + '/p'));
          mdata = JSON.parse(fs.readFileSync(systmp + '/m'));

          // Construct gd (geometry descriptor)
          gd = {
            name: objname,
            topology: tdata,
            surfaces: sdata,
            curves: cdata,
            points: pdata,
            meshes: mdata
          };
        }
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
