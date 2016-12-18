const babel = require('gulp-babel');
const browserSync = require('browser-sync').create('BrowserSync Server');
const reload = browserSync.reload;
const concat = require('gulp-concat');
const gulp = require('gulp');
const gulpSrc = require('gulp-src-ordered-globs');
const debug = require('gulp-debug');
const fs = require('fs');
const gutil = require('gulp-util');
const jshint = require('gulp-jshint');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const cache = require('gulp-cache');
const inject = require('gulp-inject');

var localEnv = 'dev';
var prod = {};
var injectTarget = gulp.src('./dev/index.html');;
var injectSource = gulp.src(['./vendor/angular/angular.js', './scripts/bundle.js', './bundle.css'], {read: false, cwd: __dirname + '/dist'})

const prodReq = function() {
  if (localEnv === 'production') {
    prod = {
      autoprefixer: require('gulp-autoprefixer'),
      noHtmlComments: require('gulp-remove-html-comments'),
      htmlify: require( 'gulp-angular-htmlify' ),
      minifyCss: require( 'gulp-minify-css' ),
      noComments: require( 'gulp-strip-comments' ),
      rename: require( 'gulp-rename' ),
      uglify: require( 'gulp-uglify' )
    }
    injectTarget = gulp.src('./dev/index.html');
    injectSource = gulp.src(['./vendor/angular/angular.js', './scripts/bundle.min.js', './bundle.min.css'], {read: false, cwd: __dirname + '/dist'})
  } else {
    null
  }
}


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

const logProd = function() {
  gutil.log('Production Mode')
}
const logDev = function() {
  gutil.log('Development Mode')
}

gulp.task('clear', function(done) {
  cached.caches = {};
  return cache.clearAll(done);
});


//###############################\\
//##-- Gulp Source Processes --##\\
//###############################\\


gulp.task('vendor', function(){
  return gulpSrc(['./vendor/**'])
  .pipe(gulp.dest('./dist'));
})

// inject dependencies
gulp.task('index', function () {
  return injectTarget
  .pipe(inject(injectSource))
    .pipe(gulp.dest('./dist'));
});

// process html
gulp.task('html', function(){
  gulp.src('./dev/**/*.html')
    .pipe(cache(localEnv === 'production' ? prod.htmlify() : gutil.noop()))
    .pipe(cache(localEnv === 'production' ? prod.noHtmlComments() : gutil.noop()))
    .pipe(gulp.dest('./dist/html/'))
    .pipe(browserSync.stream())
});

// process styles files and return one css file.
gulp.task('styles', function(){
    return gulpSrc(['./dev/styles.scss', './dev/styles/*.css', './dev/styles/*.scss'],{
      base: 'src'
    })
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(cached('css'))
    .pipe(cache(sass({
      errLogToConsole: true
    })))
    .pipe(cache(localEnv === 'production' ? prod.autoprefixer(AUTOPREFIXER_BROWSERS) : gutil.noop()))
    .pipe(cache(localEnv === 'production' ? prod.minifyCss() : gutil.noop()))
    .pipe(remember('css'))
    .pipe(concat('/bundle.css'))
    .pipe(cache(localEnv === 'production' ? prod.rename('bundle.min.css') : gutil.noop()))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream())
});

// process JS files and return the stream.
gulp.task('scripts', function(){
  return gulpSrc(['./dev/*.js', './dev/**/*.js'])
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(cached('scripts'))
    .pipe(cache(babel({
      presets: ['es2015']
    })))
    .pipe(remember('scripts'))
    .pipe(localEnv === 'production' ? prod.uglify() : gutil.noop())
    .pipe(concat('bundle.js'))
    .pipe(localEnv === 'production' ? prod.rename('bundle.min.js') : gutil.noop())
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
      baseDir: './dist'
    }
  });
  
  gulp.watch(['dev/styles.scss', './dev/*.{scss,css,sass,less,stylus}', './dev/**/*.{scss,css,sass,less,stylus}'], ['styles']);
  gulp.watch(['*.html', './dev/*.html', './dev/**/*.html']).on('change', reload);
  gulp.watch(['./dev/*js', './dev/**/*.js'], ['js-watch']);

});


//###############################\\
//##--- Set Node Environment --##\\
//###############################\\


gulp.task('setDev', function(done) {
  localEnv = 'dev';
  done();
  return process.env.NODE_ENV = 'development';
});

gulp.task('setProd', function(done) {
  localEnv = 'production';
  prodReq();
  done();
  return process.env.NODE_ENV = 'production';
});


//###############################\\
//##--- Gulp Default Process --##\\
//###############################\\


gulp.task('prod', ['setProd'], function(){
  gulp.start(['styles', 'html', 'scripts', 'index', 'serveLocal']);
});
gulp.task('default',['setDev'], function(){
  gulp.start('styles', 'html', 'scripts', 'index', 'serveLocal');
});



