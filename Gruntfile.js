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
            'vendor/jquery/dist/jquery.js',
            'vendor/handlebars/handlebars.js',
            'vendor/jasmine-jquery/lib/jasmine-jquery.js'
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
