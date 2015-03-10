'use strict';

/**
 * Module dependencies.
 */
var http = require('http');
var inspect = require('util').inspect;
var Busboy = require('busboy');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var unzip = require('unzip');
var os = require('os');

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
  var username = '';
  var dir = '';
  var stream = '';
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    username = JSON.parse(val).username;
  });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    dir = 'users/' + username;
    mkdirp(dir, function(err) {
      if (err) console.log(err);
    });
    stream = path.join(dir, path.basename(filename));
    file.pipe(fs.createWriteStream(stream));
  });
  busboy.on('finish', function() {
    res.end();
  });
  return req.pipe(busboy);
};

/**
 * Query files
 */
exports.list = function(req, res) {
  var username = req.params.username;
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

exports.findOne = function(req, res) {
  var username = req.params.username;
  var filename = req.params.filename;
  if (typeof username === 'undefined' ||
    typeof filename === 'undefined')
    return;
  var dir = 'users/' + username + '/';
  var filepath = dir + filename;
  var folder = filename.split('.')[0];
  var tempath = os.tmpdir() + '/' + folder;
  fs.open(filepath, 'r', function(err, fd) {
    if (err) {
      console.log(err);
    } else {
      var readStream = fs.createReadStream(filepath);
      var writeStream = unzip.Extract({
          path: tempath
        })
        .on('close', function() {
          console.log('Unzip completed successfully!');
        });
      readStream.pipe(writeStream);
    }
  });
};
