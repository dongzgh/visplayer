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
 * Save uploads
 */
exports.upload = function(req, res) {
  var busboy = new Busboy({ headers: req.headers });
  var username = '', dir = '', stream = '';
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
  	username = JSON.parse(val).username;
  });
	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		dir = 'users/' + username;
		mkdirp(dir, function(err) { 
			if(err) console.log(err);
		});
	  stream = path.join(dir, path.basename(filename));	 
 		file.pipe(fs.createWriteStream(stream));
	});
  busboy.on('finish', function() {
    console.log('Upload completed!');
    res.end();
  });
  return req.pipe(busboy);
};
