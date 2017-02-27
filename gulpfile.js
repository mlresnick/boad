/* eslint-env node */

'use strict';

var gulp    = require('gulp');
var connect = require('gulp-connect');
var rm      = require('gulp-rm');
var sass    = require('gulp-sass');

var debug = require('gulp-debug');

var bowerList = [
  './bower_components/framework7/dist/**/js/framework7.js',
  './bower_components/framework7/dist/**/css/framework7.{ios,material}?(.colors).css',
  './bower_components/Ionicons/**/css/ionicons.css',
  './bower_components/Ionicons/**/fonts/*'
];

var buildDependencies = ['html', 'js', 'scss', 'bower' /*, 'svg', 'jquery'*/];

function copyGlobs(src, dst) {
  return gulp
    .src(src)
    .pipe(gulp.dest(dst))
    .pipe(connect.reload());
}

function run_cmd(cmd, args, callBack) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = '';

  child.stdout.on('data', function(buffer) { resp += buffer.toString(); });
  child.stdout.on('end', function() { callBack(resp); });
}

gulp.task('webserver', function() {
  connect.server({
    port: 80,
    livereload: true,
    root: ['app']
  });
});

gulp.task('getPrivateIP', function() {
  run_cmd('ipconfig', [], function(result) {
    var lines = result.split('\n');
    var sawSection = false;
    for (var index in lines) {
      if (lines[index].includes('Wireless LAN adapter Wi-Fi')) {
        sawSection = true;
      }
      else if (sawSection && lines[index].includes('IPv4')) {
        process.stdout.write('Wi-Fi IPv4:' + lines[index].split(':')[1] + '\n');
      }

    }
  });
});

gulp.task('html', function () { return copyGlobs('./src/**/*.html', './app/'); });
gulp.task('js', function () { return copyGlobs('./src/**/*.js', './app/'); });
gulp.task('bower', function() { return copyGlobs(bowerList, './app/lib/'); });
gulp.task('scss', function () {
  // return copyGlobs('./src/**/*.scss', './app/'); });
  return gulp
    .src('./src/scss/*.scss')
    .pipe(debug())
    .pipe(
      sass({ outputStyle: 'expanded' })
      .on('error', sass.logError)
    )
    .pipe(gulp.dest('./app/css/'))
    .pipe(connect.reload());
});

gulp.task(':build', buildDependencies);
gulp.task(':clean', function() {
  return gulp
    .src(['./app/**/*'], { read: false })
    .pipe(rm());
});

gulp.task('watch', function() {
  gulp.watch(['./src/**/*.html'], ['html']);
  gulp.watch(['./src/**/js/**/*.js'], ['js']);
  gulp.watch(['./src/scss/**/*.scss'], ['scss']);
  gulp.watch(bowerList, ['bower']);
});

gulp.task('default', ['getPrivateIP', 'webserver', 'watch']);
