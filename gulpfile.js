var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-ruby-sass'),
    stylish = require('jshint-stylish'),
    fileinclude = require('gulp-file-include'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    handlebars = require('gulp-handlebars'),
    defineModule = require('gulp-define-module'),
    concat = require('gulp-concat');

var paths = {
  scripts: './src/javascripts/**/*.js',
  styles: './src/stylesheets/**/*.sass',
  images: './src/stylesheets/slot-picker-images/**/*',
  markup: ['./src/index.html', '.src/includes/slot-picker.html'],
  templates: './src/templates/*.hbs',
  dest: './dist/'
};

// lint javascript
gulp.task('lint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// include
gulp.task('include', function() {
  gulp.src('./src/index.html')
    .pipe(fileinclude())
    .pipe(gulp.dest(paths.dest));
});

// join javascript and output
gulp.task('copy', function() {
  gulp.src(paths.scripts)
    .pipe(gulp.dest(paths.dest + 'javascripts'));
  gulp.src(paths.images)
    .pipe(gulp.dest(paths.dest + 'stylesheets/slot-picker-images'));
});

// compile sass
gulp.task('sass-compile', function() {
  return gulp.src(paths.styles)
    .pipe(sass())
    .pipe(gulp.dest(paths.dest + 'stylesheets'));
});

// replace url file ref with Rails helper for Asset Pipeline
gulp.task('sass-ap', ['sass-compile'], function() {
  gulp.src(paths.dest + 'stylesheets/moj.slot-picker.css')
    .pipe(rename({suffix: '.ap'}))
    .pipe(replace(/url\(/g, 'image-url('))
    .pipe(gulp.dest(paths.dest + 'stylesheets'));
});

// include
gulp.task('include', function() {
  gulp.src('./src/index.html')
    .pipe(fileinclude())
    .pipe(gulp.dest(paths.dest));
});

// templates
gulp.task('templates', function(){
  gulp.src(paths.templates)
    .pipe(handlebars())
    .pipe(defineModule('plain', {
      wrapper: 'moj.Templates["<%= name %>"] = <%= handlebars %>'
    }))
    .pipe(concat('moj.templates.js'))
    .pipe(gulp.dest('./dist/javascripts/'));
});

// watches
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint','copy']);
  gulp.watch(paths.markup, ['include']);
  gulp.watch(paths.styles, ['sass']);
  gulp.watch(paths.templates, ['templates']);
});

// tasks
gulp.task('default', ['lint', 'include', 'copy', 'sass', 'templates']);
gulp.task('sass', ['sass-compile', 'sass-ap']);
