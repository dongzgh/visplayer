'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Slide = mongoose.model('Slide'),
  _ = require('lodash');

/**
 * Create a Slide
 */
exports.create = function(req, res) {
  let slide = new Slide(req.body);
  slide.user = req.user;

  slide.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } 
    else {
      res.jsonp(slide);
    }
  });
};

/**
 * Show the current Slide
 */
exports.read = function(req, res) {
  res.jsonp(req.slide);
};

/**
 * Update a Slide
 */
exports.update = function(req, res) {
  let slide = req.slide;

  slide = _.extend(slide, req.body);

  slide.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } 
    else {
      res.jsonp(slide);
    }
  });
};

/**
 * Delete an Slide
 */
exports.delete = function(req, res) {
  let slide = req.slide;

  slide.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } 
    else {
      res.jsonp(slide);
    }
  });
};

/**
 * List of Slides
 */
exports.list = function(req, res) {
  Slide.find().sort('-created').populate('user', 'displayName').exec(function(err, slides) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } 
    else {
      res.jsonp(slides);
    }
  });
};

/**
 * Slide middleware
 */
exports.slideByID = function(req, res, next, id) {
  Slide.findById(id).populate('user', 'displayName').exec(function(err, slide) {
    if (err) {
      return next(err);
    }
    if (!slide) {
      return next(new Error('Failed to load Slide ' + id));
    }
    req.slide = slide;
    next();
  });
};

/**
 * Slide authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.slide.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
