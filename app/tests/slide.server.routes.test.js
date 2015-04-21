'use strict';

var should = require('should'),
  request = require('supertest'),
  app = require('../../server'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Slide = mongoose.model('Slide'),
  agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, slide;

/**
 * Slide routes tests
 */
describe('Slide CRUD tests', function() {
  beforeEach(function(done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Slide
    user.save(function() {
      slide = {
        name: 'Slide Name'
      };

      done();
    });
  });

  it('should be able to save Slide instance if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Slide
        agent.post('/slides')
          .send(slide)
          .expect(200)
          .end(function(slideSaveErr, slideSaveRes) {
            // Handle Slide save error
            if (slideSaveErr) done(slideSaveErr);

            // Get a list of Slides
            agent.get('/slides')
              .end(function(slidesGetErr, slidesGetRes) {
                // Handle Slide save error
                if (slidesGetErr) done(slidesGetErr);

                // Get Slides list
                var slides = slidesGetRes.body;

                // Set assertions
                (slides[0].user._id).should.equal(userId);
                (slides[0].name).should.match('Slide Name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save Slide instance if not logged in', function(done) {
    agent.post('/slides')
      .send(slide)
      .expect(401)
      .end(function(slideSaveErr, slideSaveRes) {
        // Call the assertion callback
        done(slideSaveErr);
      });
  });

  it('should not be able to save Slide instance if no name is provided', function(done) {
    // Invalidate name field
    slide.name = '';

    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Slide
        agent.post('/slides')
          .send(slide)
          .expect(400)
          .end(function(slideSaveErr, slideSaveRes) {
            // Set message assertion
            (slideSaveRes.body.message).should.match('Please fill Slide name');

            // Handle Slide save error
            done(slideSaveErr);
          });
      });
  });

  it('should be able to update Slide instance if signed in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Slide
        agent.post('/slides')
          .send(slide)
          .expect(200)
          .end(function(slideSaveErr, slideSaveRes) {
            // Handle Slide save error
            if (slideSaveErr) done(slideSaveErr);

            // Update Slide name
            slide.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update existing Slide
            agent.put('/slides/' + slideSaveRes.body._id)
              .send(slide)
              .expect(200)
              .end(function(slideUpdateErr, slideUpdateRes) {
                // Handle Slide update error
                if (slideUpdateErr) done(slideUpdateErr);

                // Set assertions
                (slideUpdateRes.body._id).should.equal(slideSaveRes.body._id);
                (slideUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Slides if not signed in', function(done) {
    // Create new Slide model instance
    var slideObj = new Slide(slide);

    // Save the Slide
    slideObj.save(function() {
      // Request Slides
      request(app).get('/slides')
        .end(function(req, res) {
          // Set assertion
          res.body.should.be.an.Array.with.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });


  it('should be able to get a single Slide if not signed in', function(done) {
    // Create new Slide model instance
    var slideObj = new Slide(slide);

    // Save the Slide
    slideObj.save(function() {
      request(app).get('/slides/' + slideObj._id)
        .end(function(req, res) {
          // Set assertion
          res.body.should.be.an.Object.with.property('name', slide.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to delete Slide instance if signed in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new Slide
        agent.post('/slides')
          .send(slide)
          .expect(200)
          .end(function(slideSaveErr, slideSaveRes) {
            // Handle Slide save error
            if (slideSaveErr) done(slideSaveErr);

            // Delete existing Slide
            agent.delete('/slides/' + slideSaveRes.body._id)
              .send(slide)
              .expect(200)
              .end(function(slideDeleteErr, slideDeleteRes) {
                // Handle Slide error error
                if (slideDeleteErr) done(slideDeleteErr);

                // Set assertions
                (slideDeleteRes.body._id).should.equal(slideSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete Slide instance if not signed in', function(done) {
    // Set Slide user
    slide.user = user;

    // Create new Slide model instance
    var slideObj = new Slide(slide);

    // Save the Slide
    slideObj.save(function() {
      // Try deleting Slide
      request(app).delete('/slides/' + slideObj._id)
        .expect(401)
        .end(function(slideDeleteErr, slideDeleteRes) {
          // Set message assertion
          (slideDeleteRes.body.message).should.match('User is not logged in');

          // Handle Slide error error
          done(slideDeleteErr);
        });

    });
  });

  afterEach(function(done) {
    User.remove().exec();
    Slide.remove().exec();
    done();
  });
});
