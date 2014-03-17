var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-ruby-sass'),
    stylish = require('jshint-stylish');

var paths = {
  scripts: './src/javascripts/**/*.js',
  styles: './src/stylesheets/**/*',
  markup: './src/index.html',
  dest: './dest/'
};

// lint javascript
gulp.task('lint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// join javascript and output
gulp.task('concat', function() {
  gulp.src(paths.scripts)
    .pipe(gulp.dest(paths.dest + 'javascripts'));
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
  gulp.watch([paths.scripts, paths.markup], ['concat']);
  gulp.watch(paths.styles, ['sass']);
});

// tasks
gulp.task('default', ['lint', 'concat', 'sass']);
