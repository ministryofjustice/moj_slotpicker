var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-ruby-sass'),
    stylish = require('jshint-stylish');

var paths = {
  scripts: './src/javascripts/**/*.js',
  styles: './src/stylesheets/**/*.sass',
  images: './src/stylesheets/images/**/*',
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
    .pipe(gulp.dest(paths.dest + 'stylesheets/images'));
  gulp.src(paths.markup)
    .pipe(gulp.dest(paths.dest));
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

// tasks
gulp.task('default', ['lint', 'copy', 'sass']);
