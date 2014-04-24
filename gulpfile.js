var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-ruby-sass'),
    stylish = require('jshint-stylish'),
    fileinclude = require('gulp-file-include');

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
gulp.task('sass', function() {
  gulp.src(paths.styles)
    .pipe(sass())
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
  gulp.src([paths.markup])
    .pipe(fileinclude())
    .pipe(gulp.dest(paths.dest));
});

// tasks
gulp.task('default', ['lint', 'include', 'copy', 'sass']);
