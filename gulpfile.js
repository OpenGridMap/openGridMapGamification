var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    watch = require('gulp-watch');



gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('stylesheets/*.css', function(){
    	gulp.run('css')
    });
});

livereload({
    start: true
});
