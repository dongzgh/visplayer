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
  // Initialize busboy
  var busboy = new Busboy({
    headers: req.headers
  });

  // Upload file
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
  // Check input data
  var username = req.user.username;
  if (typeof username === 'undefined')
    return;

  // List files
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
exports.retrieve = function(req, res) {
  // Get level
  var mode = req.query.mode;
  if (typeof mode === 'undefined') {
    mode = 'load';
  }

  // Retrieve file or data
  if (mode === 'load') {
    exports.load(req, res);
  } else if (mode === 'download') {
    exports.download(req, res);
  }
};

exports.load = function(req, res) {
  // Check input data
  var username = req.user.username;
  var filename = req.params.filename;
  if (typeof username === 'undefined' || typeof filename === 'undefined') {
    return;
  }

  // Get level
  var level = req.query.level;
  if (typeof level === 'undefined') {
    level = 'display';
  }

  // Get ext
  var ext = path.extname(filename);
  var handle;
  if (ext === '.vis') {
    handle = exports.loadVis;
  }

  // Load data
  if (handle) {
    var filepath = 'users/' + username + '/' + filename;
    handle(res, filepath, level);
  }
};

exports.download = function(req, res) {
  // Check input data
  var username = req.user.username;
  var filename = req.params.filename;
  if (typeof username === 'undefined' || typeof filename === 'undefined') {
    return;
  }

  // Download file
  var filepath = __dirname + '/../../../' + 'users/' + username + '/' + filename;
  res.download(filepath, filename, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).end();
    }
  });
};

/**
 * Delete file
 */
exports.delete = function(req, res) {
  // Check input data
  var username = req.user.username;
  var filename = req.params.filename;
  if (typeof username === 'undefined' || typeof filename === 'undefined') {
    return;
  }

  // Delete file
  var filepath = 'users/' + username + '/' + filename;
  fs.unlink(filepath, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).end();
    }
  });
};
