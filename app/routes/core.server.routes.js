'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller');
	app.route('/').get(core.index);

  // Files routes
  // Setting the upload route
  app.route('/files/upload').post(core.upload);
  
  // Setting the list user files route
  app.route('/files/:username').get(core.list);
};
