var gulp = require('gulp'),
    pkg = require('./package.json'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-ruby-sass'),
    stylish = require('jshint-stylish'),
    fileinclude = require('gulp-file-include'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    header = require('gulp-header');

var paths = {
  scripts: './src/javascripts/**/*.js',
  styles: './src/stylesheets/**/*.sass',
  images: './src/stylesheets/images/**/*',
  markup: ['./src/index.html', './src/includes/slot-picker.html'],
  dest: './dist/'
};

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

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
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(paths.dest + 'javascripts'));
  gulp.src(paths.images)
    .pipe(gulp.dest(paths.dest + 'stylesheets/images'));
});

// compile sass
gulp.task('sass-compile', function() {
  return gulp.src(paths.styles)
    .pipe(sass())
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(paths.dest + 'stylesheets'));
});

// replace url file ref with Rails helper for Asset Pipeline
gulp.task('sass-ap', ['sass-compile'], function() {
  gulp.src(paths.dest + 'stylesheets/moj.slot-picker.css')
    .pipe(rename({suffix: '.ap'}))
    .pipe(replace(/url\(/g, 'image-url('))
    .pipe(gulp.dest(paths.dest + 'stylesheets'));
  gulp.src(paths.dest + 'stylesheets/moj.date-slider.css')
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

// watches
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint','copy']);
  gulp.watch(paths.markup, ['include']);
  gulp.watch(paths.styles, ['sass']);
});

// tasks
gulp.task('default', ['lint', 'include', 'copy', 'sass']);
gulp.task('sass', ['sass-compile', 'sass-ap']);
