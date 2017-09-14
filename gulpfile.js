/* eslint-env node */

'use strict';

const browserify = require('browserify');
const buffer = require('vinyl-buffer');
// const chalk = require('chalk');
const connect = require('gulp-connect');
const gulp = require('gulp');
const gutil = require('gulp-util');
const notifier = require('node-notifier');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
// const spawn = require('child_process').spawn;
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
  './node_modules/framework7/dist/**/css/framework7.{ios,material}?' +
    '(.colors).css',
  './node_modules/ionicons/**/css/ionicons.css',
  './node_modules/ionicons/**/fonts/*',
];

const buildDependencies = ['html', 'js', 'scss', 'node', 'jquery'];

function copyGlobs(src, dst) {
  return gulp
    .src(src)
    .pipe(gulp.dest(dst))
    .pipe(connect.reload());
}

// function runCmd(cmd, args, callBack) {
//   const child = spawn(cmd, args);
//   let resp = '';
//
//   child.stdout.on('data',
//     (outputBuffer) => { resp += outputBuffer.toString(); }
//   );
//   child.stdout.on('end', () => callBack(resp));
// }

// XXX function rebundle(b, output) {
//   return b
//     .require('./src/js/index.js' /* XXX , { expose: 'globalNamespace' } */)
//     .on('error', (err) => {
//       console.error(err); // eslint-disable-line no-console
//       this.emit('end');
//     })
//     // .transform(babelify)
//     .bundle()
//     .pipe(source(output))
//     .pipe(buffer()) // required for sourcemaps
//     .pipe(sourcemaps.init())
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest('./app/js'));
// }
//
// function doBrowserify(sources) {
//   const filenames = glob.sync(sources);
//   const browserified = browserify({
//     entries: filenames,
//     debug: true,
//   });
//   return browserified;
// }
//
// function bundle(sources, output) {
//   return rebundle(doBrowserify(sources), output);
// }
//
// gulp.task('package-src',
//   () => bundle('./src/js/**/*.js', 'alt-boad.js'));
//
// gulp.task('test-dev', () => bundle('./spec/**/*-spec.js', 'spec.js'));

gulp.task('webserver', () => {
  connect.server({
    // port: 80,
    livereload: true,
    root: ['app'],
  });
});

// XXX:
// gulp.task('getPrivateIP', () => {
//   runCmd('ipconfig', [], (result) => {
//     const lines = result.split('\n');
//     let sawSection = false;
//     lines.forEach((line) => {
//       if (line.includes('Wireless LAN adapter Wi-Fi')) {
//         sawSection = true;
//       }
//       else if (sawSection && line.includes('IPv4')) {
//         process.stdout.write(
//           chalk.magenta(
//             ` *****\n *\n *  Wi-Fi IPv4:${line.split(':')[1]}\n *\n *****\n`
//           )
//         );
//       }
//     });
//   });
// });


gulp.task('html', () => copyGlobs('./src/**/*.html', './app/'));
gulp.task('jquery',
  () => copyGlobs('./node_modules/jquery/dist/jquery.js', './app/lib/js')
);
gulp.task('node', () => copyGlobs(nodeList, './app/lib/'));
gulp.task('js', () =>
  // set up the browserify instance on a task basis
  browserify('./src/js/index.js')
    .bundle()
    .on('error', err => audibleLog.call(this, err.message, 'browsify'))
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
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync({ outputStyle: 'expanded' })
        .on('error', err => audibleLog.call(this, err.messageFormatted, 'scss'))
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./app/css/'))
    .pipe(connect.reload())
);

gulp.task(':build', buildDependencies);
gulp.task(':clean',
  () => gulp.src(['./app/**/*', './app/**/.*'], { read: false }).pipe(rm())
);

gulp.task('watch', () => {
  gulp.watch(['./src/**/*.html'], ['html']);
  gulp.watch(['./src/**/js/**/*.js'], ['js']);
  // gulp.watch(['./src/**/js/**/*.js', './spec/**/*-spec.js'], ['tests']);
  gulp.watch(['./src/scss/**/*.scss'], ['scss']);
  gulp.watch(['./node_modules/jquery/dist/jquery.js'], ['jquery']);
  gulp.watch(nodeList, ['node']);
});


gulp.task('default', [/* 'getPrivateIP', */'webserver', 'watch']);
