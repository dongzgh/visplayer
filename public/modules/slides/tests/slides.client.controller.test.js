'use strict';

(function() {
	// Slides Controller Spec
	describe('Slides Controller Tests', function() {
		// Initialize global variables
		var SlidesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Slides controller.
			SlidesController = $controller('SlidesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Slide object fetched from XHR', inject(function(Slides) {
			// Create sample Slide using the Slides service
			var sampleSlide = new Slides({
				name: 'New Slide'
			});

			// Create a sample Slides array that includes the new Slide
			var sampleSlides = [sampleSlide];

			// Set GET response
			$httpBackend.expectGET('slides').respond(sampleSlides);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.slides).toEqualData(sampleSlides);
		}));

		it('$scope.findOne() should create an array with one Slide object fetched from XHR using a slideId URL parameter', inject(function(Slides) {
			// Define a sample Slide object
			var sampleSlide = new Slides({
				name: 'New Slide'
			});

			// Set the URL parameter
			$stateParams.slideId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/slides\/([0-9a-fA-F]{24})$/).respond(sampleSlide);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.slide).toEqualData(sampleSlide);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Slides) {
			// Create a sample Slide object
			var sampleSlidePostData = new Slides({
				name: 'New Slide'
			});

			// Create a sample Slide response
			var sampleSlideResponse = new Slides({
				_id: '525cf20451979dea2c000001',
				name: 'New Slide'
			});

			// Fixture mock form input values
			scope.name = 'New Slide';

			// Set POST response
			$httpBackend.expectPOST('slides', sampleSlidePostData).respond(sampleSlideResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Slide was created
			expect($location.path()).toBe('/slides/' + sampleSlideResponse._id);
		}));

		it('$scope.update() should update a valid Slide', inject(function(Slides) {
			// Define a sample Slide put data
			var sampleSlidePutData = new Slides({
				_id: '525cf20451979dea2c000001',
				name: 'New Slide'
			});

			// Mock Slide in scope
			scope.slide = sampleSlidePutData;

			// Set PUT response
			$httpBackend.expectPUT(/slides\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/slides/' + sampleSlidePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid slideId and remove the Slide from the scope', inject(function(Slides) {
			// Create new Slide object
			var sampleSlide = new Slides({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Slides array and include the Slide
			scope.slides = [sampleSlide];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/slides\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSlide);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.slides.length).toBe(0);
		}));
	});
}());