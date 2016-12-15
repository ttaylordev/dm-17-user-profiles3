const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync')
  .create('BrowserSync Server');
const reload = browserSync.reload;
const concat = require('gulp-concat');
const gulp = require('gulp');
const gulpSrc = require('gulp-src-ordered-globs');
const gutil = require('gulp-util');
const jshint = require('gulp-jshint');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');


//###############################\\
//##---- Internal Functions ---##\\
//###############################\\


// error handling
var onError = function(err){
  gutil.beep();
  console.log(err);
  this.emit('end');
};

// Browser definitions for autoprefixer
var AUTOPREFIXER_BROWSERS = [
  'last 3 versions',
  'ie >= 8',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];


//###############################\\
//##-- Gulp Source Processes --##\\
//###############################\\


// process html
gulp.task('html', function(){
  gutil.log('html process is running');
  gulp.src('./dev/**/*.html')
    .pipe(gulp.dest('./dist/html/'))
    .pipe(browserSync.stream())
});

// process styles files and return one css file.
gulp.task('styles', function(){
  gutil.log('styles process is running');
  return gulpSrc(['./dev/styles.scss', './dev/styles/*.css', './dev/styles/*.scss'],{
      base: 'src'
    })
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(concat('/bundle.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream())
});

// process JS files and return the stream.
gulp.task('scripts', function(){
  gutil.log('scripts process is running');
  return gulpSrc(['./dev/*.js', './dev/**/*.js'])
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write( './maps', {
      includeContent: true,
      sourceRoot: './dev/'
    }))
    .pipe(gulp.dest('./dist/scripts'))
    .pipe(browserSync.stream())
});


//###############################\\
//##- Gulp Adjunct Processes --##\\
//###############################\\


// Optimize Images task
gulp.task('images', function (){
  return gulp.src('./dev/images/*.{gif,jpg,png}')
    .pipe(gulp.dest('./dist/images/'))
});

// browser-sync
gulp.task('browser-sync', function(){
  browserSync.init({
    injectChanges: true,
    server: {
      baseDir: './'
    }
  });
});

// browser-sync reload
gulp.task('reload', function(){
  browserSync.reload();
  gutil.log('reloading from task');
});

// ensure scripts is done running, before reloading from gulp.watch()..
gulp.task('js-watch', ['scripts'], function (done){
    browserSync.reload();
    done();
});

gulp.task('serveLocal', function(){
  browserSync.init({
    injectChanges: true,
    server: {
      baseDir: './'
    }
  });
  
  gulp.watch(['dev/styles.scss', './dev/*.{scss,css,sass,less,stylus}', './dev/**/*.{scss,css,sass,less,stylus}'], ['styles']);
  gulp.watch(['*.html', './dev/*.html', './dev/**/*.html']).on('change', reload);
  gulp.watch(['./dev/*js', './dev/**/*.js'], ['js-watch']);

});


//###############################\\
//##--- Gulp Default Process --##\\
//###############################\\


gulp.task('default',['scripts', 'html', 'styles', 'serveLocal']);

