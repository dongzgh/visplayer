'use strict';

module.exports = function(app) {
  var users = require('../controllers/users.server.controller');
  var slides = require('../controllers/slides.server.controller');

  // Slides routes
  app.route('/slides')
    .get(slides.list)
    .post(users.requiresLogin, slides.create);

  app.route('/slides/:slideId')
    .get(slides.read)
    .put(users.requiresLogin, slides.hasAuthorization, slides.update)
    .delete(users.requiresLogin, slides.hasAuthorization, slides.delete);

  // Finish by binding the Slide middleware
  app.param('slideId', slides.slideByID);
};
