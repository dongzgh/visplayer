'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var Busboy = require('busboy');

/**
 * Entry point
 */
exports.index = function(req, res) {
  res.render('index', {
    user: req.user || null,
    request: req
  });
};

/**
 * Upload files
 */
exports.upload = function(req, res) {
  var busboy = new Busboy({
    headers: req.headers
  });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var dir = 'users/' + req.user.username;
    mkdirp(dir, function(err) {
      if (err) {
        console.log(err);
      } else {
        var destname = path.join(dir, path.basename(filename));
        file.pipe(fs.createWriteStream(destname));
      }
    });    
  });
  busboy.on('finish', function() {
    res.status(200).end();
  });
  return req.pipe(busboy);
};

/**
 * Query files
 */
exports.list = function(req, res) {
  var username = req.user.username;
  if (typeof username === 'undefined')
    return;
  var dir = 'users/' + username;
  fs.readdir(dir, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      res.send(files);
    }
  });
};

/**
 * Load file
 */
exports.load = function(req, res) {
  var username = req.user.username;
  var filename = req.params.filename;
  if (typeof username === 'undefined' ||
    typeof filename === 'undefined')
    return;
  var filepath = 'users/' + username + '/' + filename;
  var ext = path.extname(filename);
  if (ext === '.vis') {
    exports.loadVis(res, filepath);
  } else {
    res.status(404).end();
  }
};

/**
 * Delete file
 */
exports.delete = function(req, res) {
  var username = req.user.username;
  var filename = req.params.filename;
  if (typeof username === 'undefined' || typeof filename === 'undefined') return;
  var filepath = 'users/' + username + '/' + filename;
  fs.unlink(filepath, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).end();
    }
  });
};
