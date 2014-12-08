module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jasmine: {
      test: {
        src: [
          'src/javascripts/moj.slot-picker.js',
          'src/javascripts/moj.date-slider.js'
        ],
        options: {
          vendor: [
            'vendor/modernizr.custom.85598.js',
            'vendor/jquery-1.11.0.js',
            'vendor/handlebars-v1.3.0.js',
            'vendor/jasmine-jquery.js'
          ],
          specs: 'tests/spec/*Spec.js',
          display: 'short',
          outfile: 'SpecRunner.html',
          keepRunner: true
        }
      }
    }
  });

  // Load plugin
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Task to run tests
  grunt.registerTask('default', 'jasmine');
};
