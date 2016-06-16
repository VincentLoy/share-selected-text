/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100, node: true */

/*global require*/
(function () {
    'use strict';

    var concat = require('gulp-concat'),
        babel = require('gulp-babel'),
        gulp = require('gulp'),
        plumber = require('gulp-plumber'),
        uglify = require('gulp-uglify'),
        less = require('gulp-less'),
        glob = require('glob'),

        LessPluginCleanCSS = require('less-plugin-clean-css'),
        LessPluginAutoPrefix = require('less-plugin-autoprefix'),
        cleancss = new LessPluginCleanCSS({advanced: true}),
        autoprefix = new LessPluginAutoPrefix({browsers: ['last 3 versions']});

    gulp.task('build:app', function () {
        gulp.src('dev/shareSelectedText.js')
            .pipe(plumber())
            .pipe(babel())
            .pipe(concat('shareSelectedText.js'))
            .pipe(gulp.dest('dist'));

        return gulp.src('dev/shareSelectedText.js')
            .pipe(plumber())
            .pipe(babel())
            .pipe(uglify())
            .pipe(concat('shareSelectedText.min.js'))
            .pipe(gulp.dest('dist'));
    });

    gulp.task('build:less:demo', function () {
        return gulp.src('demo/demo.less')
            .pipe(plumber({
                handleError: function (err) {
                    console.log(err);
                    this.emit('end');
                }
            }))
            .pipe(less({
                plugins: [autoprefix, cleancss]
            }))
            .pipe(concat('demo.min.css'))
            .pipe(gulp.dest('demo'));
    });

    gulp.task('build:less:app', function () {
        return gulp.src('dev/shareSelectedText.less')
            .pipe(plumber({
                handleError: function (err) {
                    console.log(err);
                    this.emit('end');
                }
            }))
            .pipe(less({
                plugins: [autoprefix, cleancss]
            }))
            .pipe(concat('shareSelectedText.min.css'))
            .pipe(gulp.dest('dist'));
    });

    gulp.task('build:all', ['build:app', 'build:less:app', 'build:less:demo']);

    gulp.task('watch', function () {
        gulp.watch('dev/shareSelectedText.js', ['build:app']);
        gulp.watch('**/*.less', ['build:less:app', 'build:less:demo']);
    });

    gulp.task('default', ['build:all', 'watch']);
}());
