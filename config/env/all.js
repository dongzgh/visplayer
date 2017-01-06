'use strict';

module.exports = {
  app: {
    title: 'visplayer',
    description: 'A playground for online computing visualization.',
    keywords: 'geometry, data, visualization, computing'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
  sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
  sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: null,
		// To set the cookie in a specific domain uncomment the following
		// setting:
		// domain: 'yourdomain.com'
	},
	// The session cookie name
	sessionName: 'connect.sid',
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
  assets: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
      ],
      js: [
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-cookies/angular-cookies.js',        
        'public/lib/angular-touch/angular-touch.js',
        'public/lib/angular-sanitize/angular-sanitize.js',        
        'public/lib/ng-file-upload/angular-file-upload-shim.js',
        'public/lib/ng-file-upload/angular-file-upload.js',
        'public/lib/cryptojslib/rollups/aes.js',
        'public/lib/dat-gui/build/dat.gui.js',
        'public/lib/threejs/build/three.js',
        'public/lib/threejs/examples/js/Detector.js',
        'public/lib/threejs/examples/js/controls/OrbitControls.js',
        'public/lib/threejs/examples/js/controls/TrackballControls.js',
        'public/lib/threejs/examples/js/controls/TransformControls.js'
      ]
    },
    css: [
      'public/modules/**/css/*.css',
      'public/modules/core/css/fonts.css'
    ],
    js: [
      'public/config.js',
      'public/application.js',
      'public/modules/*/*.js',
      'public/modules/*/*[!tests]*/*.js'
    ],
    tests: [
      'public/lib/angular-mocks/angular-mocks.js',
      'public/modules/*/tests/*.js'
    ]
  }
};
