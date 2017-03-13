/* eslint-env node */

'use strict';

const browserifier = require('browserify');
const buffer = require('vinyl-buffer');
const chalk = require('chalk');
const connect = require('gulp-connect');
const gulp = require('gulp');
const gutil = require('gulp-util');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const spawn = require('child_process').spawn;
const source = require('vinyl-source-stream');

function audibleLog(err) {
  gutil.beep();
  gutil.log(chalk.cyan('Browserify'), chalk.red('Error'), `\n\n\t\t${err.message}\n\n`);
  this.emit('end');
}

gulp.task('js', () =>
  // set up the browserify instance on a task basis
  browserifier('./src/js/index.js')
    .bundle()
    .on('error', audibleLog)
    .pipe(source('./boad.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
        // Add transformation tasks to the pipeline here.
        // .pipe(uglify())
        // .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app/js/'))
    .pipe(connect.reload())
);

const bowerList = [
  './bower_components/framework7/dist/**/js/framework7.js',
  './bower_components/framework7/dist/**/css/framework7.{ios,material}?(.colors).css',
  './bower_components/Ionicons/**/css/ionicons.css',
  './bower_components/Ionicons/**/fonts/*',
];

const buildDependencies = ['html', 'js', 'scss', 'bower'/* , 'svg', 'jquery' */];

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
gulp.task('jquery', () => copyGlobs('./bower_components/jquery/dist/jquery.js', './app/lib/js'));
gulp.task('bower', () => copyGlobs(bowerList, './app/lib/'));
gulp.task('scss', () =>
  gulp
    .src('./src/scss/*.scss')
    .pipe(
      sass({ outputStyle: 'expanded' })
      .on('error', (err) => {
        gutil.beep();
        return sass.logError.bind(this)(err);
      })
    )
    .pipe(gulp.dest('./app/css/'))
    .pipe(connect.reload())
);

gulp.task(':build', buildDependencies);
gulp.task(':clean', () => gulp.src(['./app/**/*'], { read: false }).pipe(rm()));

gulp.task('watch', () => {
  gulp.watch(['./src/**/*.html'], ['html']);
  gulp.watch(['./src/**/js/**/*.js'], ['js']);
  gulp.watch(['./src/scss/**/*.scss'], ['scss']);
  gulp.watch(['./bower_components/jquery/dist/jquery.js'], ['jquery']);
  gulp.watch(bowerList, ['bower']);
});

gulp.task('default', ['getPrivateIP', 'webserver', 'watch']);
