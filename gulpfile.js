/* eslint-env node */

'use strict';

const browserifier = require('browserify');
const buffer = require('vinyl-buffer');
const connect = require('gulp-connect');
const gulp = require('gulp');
const gutil = require('gulp-util');
const notifier = require('node-notifier');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const spawn = require('child_process').spawn;
const source = require('vinyl-source-stream');

function audibleLog(errorMessage, plugin) {
  gutil.beep();
  notifier.notify({
    title: `${'Error'} in plugin ${plugin}`,
    message: errorMessage,
    sound: false,
  });
  gutil.log(new gutil.PluginError(plugin, errorMessage).toString());
  this.emit('end');
}

const nodeList = [
  './node_modules/framework7/dist/**/js/framework7.js',
  './node_modules/framework7/dist/**/css/framework7.{ios,material}?(.colors).css',
  './node_modules/ionicons/dist/**/css/ionicons.css',
  './node_modules/ionicons/dist/**/fonts/*',
];

const buildDependencies = ['html', 'js', 'scss', 'node', 'jquery'];

function copyGlobs(src, dst) {
  return gulp
    .src(src)
    .pipe(gulp.dest(dst))
    .pipe(connect.reload());
}

function runCmd(cmd, args, callBack) {
  const child = spawn(cmd, args);
  let resp = '';

  child.stdout.on('data', (outputBuffer) => { resp += outputBuffer.toString(); });
  child.stdout.on('end', () => callBack(resp));
}

gulp.task('webserver', () => {
  connect.server({
    port: 80,
    livereload: true,
    root: ['app'],
  });
});

gulp.task('getPrivateIP', () => {
  runCmd('ipconfig', [], (result) => {
    const lines = result.split('\n');
    let sawSection = false;
    lines.forEach((line) => {
      if (line.includes('Wireless LAN adapter Wi-Fi')) {
        sawSection = true;
      }
      else if (sawSection && line.includes('IPv4')) {
        process.stdout.write(`Wi-Fi IPv4:${line.split(':')[1]}\n`);
      }
    });
  });
});

gulp.task('html', () => copyGlobs('./src/**/*.html', './app/'));
gulp.task('jquery', () => copyGlobs('./node_modules/jquery/dist/jquery.js', './app/lib/js'));
gulp.task('node', () => copyGlobs(nodeList, './app/lib/'));
gulp.task('js', () =>
  // set up the browserify instance on a task basis
  browserifier('./src/js/index.js')
  .bundle()
    .on('error', function logBrowsifyError(err) { audibleLog.call(this, err.message, 'browsify'); })
  .pipe(source('./boad.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('./app/js/'))
  .pipe(connect.reload())
  );
gulp.task('scss', () =>
  gulp
    .src('./src/scss/*.scss')
    .pipe(
      sass.sync({ outputStyle: 'expanded' })
      .on('error', function logScssError(err) { audibleLog.call(this, err.messageFormatted, 'scss'); })
    )
    .pipe(gulp.dest('./app/css/'))
    .pipe(connect.reload())
);

gulp.task(':build', buildDependencies);
gulp.task(':clean', () => gulp.src(['./app/**/*', './app/**/.*'], { read: false }).pipe(rm()));

gulp.task('watch', () => {
  gulp.watch(['./src/**/*.html'], ['html']);
  gulp.watch(['./src/**/js/**/*.js'], ['js']);
  gulp.watch(['./src/scss/**/*.scss'], ['scss']);
  gulp.watch(['./node_modules/jquery/dist/jquery.js'], ['jquery']);
  gulp.watch(nodeList, ['node']);
});

gulp.task('default', ['getPrivateIP', 'webserver', 'watch']);
