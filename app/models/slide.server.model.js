'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Slide Schema
 */
var SlideSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Slide name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Slide', SlideSchema);