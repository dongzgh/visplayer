'use strict';

module.exports = function(app) {
  // Root routing
  var core = require('../controllers/core.server.controller');
  app.route('/').get(core.index);

  // Files routes
  // Setting up the upload route
  app.route('/upload').post(core.upload);

  // Setting up the query routes
  app.route('/files').get(core.list);

  // Setting up the load route
  app.route('/files/:filename')
    .get(core.retrieve)
    .delete(core.delete);
};