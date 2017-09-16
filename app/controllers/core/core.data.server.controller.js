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
exports.loadVis = function(res, filePath) {
  // Get file information
  var fileName = path.basename(filePath);
  var objectName = fileName.split('.')[0];
  var tempPath = os.tmpdir() + '/' + objectName;

  // Open file
  fs.open(filePath, 'r', function(err, file) {
    if(err) {
      console.log(err);
    } else {
      // Unzip file
      var input = fs.createReadStream(filePath);
      var output = unzip.Extract({
        path: tempPath
      }).on('close', function() {
        // Read data from tempPath
        var tData = JSON.parse(fs.readFileSync(tempPath + '/t'));
        var sData = JSON.parse(fs.readFileSync(tempPath + '/s'));
        var cData = JSON.parse(fs.readFileSync(tempPath + '/c'));
        var pData = JSON.parse(fs.readFileSync(tempPath + '/p'));
        var mData = JSON.parse(fs.readFileSync(tempPath + '/m'));

        // Construct modelData (geometry descriptor)
        var modelData = {
          name: objectName,
          topology: tData,
          surfaces: sData,
          curves: cData,
          points: pData,
          meshes: mData
        };

        // Close file.
        fs.close(file);

        // Send data
        // var msg = encryptData(res.req.user.id, modelData); // encrype data
        var msg = JSON.stringify(modelData);
        res.set('ContentLength', msg.length);
        res.send(msg).status(200).end();
      });
      input.pipe(output);
    }
  });
};