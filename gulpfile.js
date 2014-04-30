var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-ruby-sass'),
    stylish = require('jshint-stylish'),
    fileinclude = require('gulp-file-include'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace');

var paths = {
  scripts: './src/javascripts/**/*.js',
  styles: './src/stylesheets/**/*.sass',
  images: './src/stylesheets/slot-picker-images/**/*',
  markup: './src/index.html',
  dest: './dist/'
};

// lint javascript
gulp.task('lint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
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

gulp.task('sass-ap', ['sass-compile'], function() {
  gulp.src(paths.dest + 'stylesheets/moj.slot-picker.css')
    .pipe(rename({suffix: '.ap'}))
    .pipe(replace(/url\(/g, 'image-url('))
    .pipe(gulp.dest(paths.dest + 'stylesheets'));
});

// watches
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint']);
  gulp.watch([paths.scripts, paths.markup], ['copy']);
  gulp.watch(paths.styles, ['sass']);
});

// include
gulp.task('include', function() {
  gulp.src(paths.markup)
    .pipe(fileinclude())
    .pipe(gulp.dest(paths.dest));
});

// tasks
gulp.task('default', ['lint', 'include', 'copy', 'sass']);
gulp.task('sass', ['sass-compile', 'sass-ap']);
