'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend core's controller
 */
module.exports = _.extend(
  require('./core/core.file.server.controller'),
  require('./core/core.data.server.controller')
);
