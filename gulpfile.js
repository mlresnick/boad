/* eslint-env node */
var gulp = require("gulp");
var connect = require("gulp-connect");

gulp.task("webserver", function() {
  connect.server({
    port:80,
    livereload: true,
    root: [".", "app"]
  });
});

gulp.task("html", function () {
  gulp.src("./app/*.html")
    .pipe(connect.reload());
});

gulp.task("css", function () {
  gulp.src("./app/css/*.css")
    .pipe(connect.reload());
});

gulp.task("js", function () {
  gulp.src("./app/js/*.js")
    .pipe(connect.reload());
});

gulp.task("watch", function() {
  gulp.watch(["./app/*.html"],["html"]);
  gulp.watch(["./app/css/*.css"],["css"]);
  gulp.watch(["./app/js/*.js"],["js"]);
});

function run_cmd(cmd, args, callBack ) {
  var spawn = require("child_process").spawn;
  var child = spawn(cmd, args);
  var resp = "";

  child.stdout.on("data", function (buffer) { resp += buffer.toString(); });
  child.stdout.on("end", function() { callBack (resp); });
}

gulp.task("getPrivateIP", function () {
  run_cmd("ipconfig", [], function (result) {
    var lines = result.split("\n");
    var sawSection = false;
    for (var index in lines) {
      if (lines[index].includes("Wireless LAN adapter Wi-Fi")) {
        sawSection = true;
      }
      else if (sawSection && lines[index].includes("IPv4")) {
        process.stdout.write("Wi-Fi IPv4:" + lines[index].split(":")[1]+"\n");
      }

    }
  });
});

gulp.task("default", ["getPrivateIP", "webserver", "watch"]);
