var syntax        = 'scss'; // Syntax: sass or scss;
var gulp          = require('gulp'),
sass              = require('gulp-sass'),
rename            = require('gulp-rename'),
concat            = require('gulp-concat'),
autoprefixer      = require('gulp-autoprefixer'),
cleancss          = require('gulp-clean-css'),
notify            = require("gulp-notify"),
uglify            = require('gulp-uglify'),
browsersync       = require('browser-sync'),
deleteLines       = require('gulp-delete-lines'),
tinypng           = require('gulp-tinypng-unlimited')
spritesmith       = require('gulp.spritesmith');
var babel         = require('gulp-babel');
var del           = require('del');

// Local server browser-sync
gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false
	})
});


// Do sprite Task
gulp.task('sprite', function() {
  var spriteData = gulp.src('./app/imgForSprite/*.*')
  .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.css',
  }));

  spriteData.img.pipe(gulp.dest('./app/img/')); 
  spriteData.css.pipe(gulp.dest('./app/css/')); 
});

gulp.task('clean', () => {
  return del('production/js');
});

gulp.task('production-html', function() {
  return gulp.src('./app/*.html')
  .pipe(deleteLines({
    'filters': [
      /<script\s+type=["']text\/javascript["']\s+src=/i
    ]
  }))
  .pipe(gulp.dest('production/'))
});

gulp.task('styles', function() {
  return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
  .pipe(sass({outputStyle: 'expand' }).on("error", notify.onError()))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(autoprefixer(['last 15 versions']))
	.pipe(gulp.dest('app/css'))
	.pipe(browsersync.reload( {stream: true} ))
});


gulp.task('production-styles', function() {
  return gulp.src([
    'app/libs/**/*.css', // Always at the end
    'app/css/main.css',
   ])
  .pipe(concat('main.min.css'))
  .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
  .pipe(gulp.dest('production/css'))
});

// Watch on js file
gulp.task('js', function() {
  return gulp.src('app/js/**/*.js')
  .pipe(browsersync.reload({ stream: true }))
});


// Get and minify all js files and push in production directory
gulp.task('production-js', ['clean'], function() {
  return gulp.src([
    'app/js/libs/**/*.js',
    'app/js/main.min.js', // Always at the end
   ])
  .pipe(babel())
  .pipe(concat('main.min.js'))
  .pipe(uglify()) // Mifify js (opt.)
  .pipe(gulp.dest('production/js'))
});

// Get and minify all images and push in production directory
gulp.task('production-img', function() {
  return gulp.src(['app/img/**/*.png','app/img/**/*.jpg'])
  .pipe(tinypng())
  .pipe(gulp.dest('production/img'))
});

// Wacth on files and reload index.html page
gulp.task('watch', ['styles', 'browser-sync'], function() {
  gulp.watch('app/'+syntax+'/**/*.'+syntax+'', ['styles']);
  gulp.watch(['libs/**/*.js', 'app/js/**/*.js'], ['js']);
	gulp.watch('app/*.html', browsersync.reload)
});

// Production
gulp.task('production', ['production-js', 'production-styles', 'production-html', 'production-img']);


// Default gulp task 
gulp.task('default', ['watch']);