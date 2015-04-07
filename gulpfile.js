/**
 * Created by BearJ on 2015/4/1.
 */

var gulp = require("gulp");
var uglify = require("gulp-uglify");

gulp.task("default", function () {
    gulp.src("src/onepx.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist"));

    gulp.src("src/**/!(onepx.js)")
        .pipe(gulp.dest("dist"));
});