'use strict';

var gulp            = require('gulp');
var sass            = require('gulp-sass');
var sassLint        = require('gulp-sass-lint');
var autoprefixer    = require('autoprefixer');
var haml            = require('gulp-haml');

var CleanCSS        = require('clean-css');
var vinylMap        = require('vinyl-map');

var uglify          = require('gulp-uglify');
var watchify        = require('watchify');
var browserify      = require('browserify');
var babelify        = require('babelify');
var source          = require('vinyl-source-stream');
var gutil           = require('gutil');
var postcss         = require('gulp-postcss');
var jshint          = require('gulp-jshint');
var stylish         = require('jshint-stylish');

var browserSync = require('browser-sync').create();

var paths = {
    'src': {
        'styles': './app/src/styles/**/*.scss',
        'js': './app/src/js/app.js',
        'jsAllFiles': './app/src/js/**/*.js',
        'haml': './app/haml/**/*.haml',
    },
    'dist': {
        'styles': './public/dist/styles',
        'js': './public/dist/js',
    }
};

var processors = [
    autoprefixer({
        browsers: ['> 1% in PL', 'IE >= 9', 'last 2 version']
    })
];

gulp.task('sass', () => {
    return gulp.src(paths.src.styles)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest(paths.dist.styles));
});

gulp.task('minify-css', ['sass'], () => {
    var minify = vinylMap(function (buff) {
        return new CleanCSS({
            relativeTo: paths.dist.styles,
            processImport: true,
            advanced: false
        }).minify(buff.toString()).styles;
    });

    return gulp.src(paths.dist.styles + '/styles.css')
        .pipe(minify)
        .pipe(gulp.dest(paths.dist.styles))
        .pipe(browserSync.stream());
});

gulp.task('sass-lint', () => {
    return gulp.src(paths.src.styles)
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
});

gulp.task('js-lint', ['js'], () => {
    return gulp.src([
            './js/**/*.js',
            './gulpfile.babel.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

var bundler = browserify({
        entries: [paths.src.js],
        cache: {},
        packageCache: {},
        debug: false,
        plugin: [watchify]
    })
    .transform(babelify.configure({
        compact: true,
        presets: ['es2015']
    }))
    .on('log', gutil.log)
    .on('end', function () {
        console.log('ended bundler app.js');
    });

function initBrowserify() {
    return bundler.bundle()
        .on('error',
            function (err) {
                console.log(err.toString());
                this.emit('end');
            }
        )
        .pipe(source('app.js'))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(browserSync.stream());
}

gulp.task('js', initBrowserify);

gulp.task('minify-js', () => {
    return gulp.src([
            './dist/js/app.js',
        ])
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('haml', () => {
  gulp.src('./app/haml/**/*.haml')
    .pipe(haml())
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.stream());
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './public'
        }
    });
});

gulp.task('watch', ['browser-sync', 'haml', 'sass-lint', 'minify-css', 'js-lint'], () => {
    gulp.watch(paths.src.styles, ['sass-lint', 'minify-css']);
    gulp.watch([paths.src.jsAllFiles, './gulpfile.babel.js'], ['js-lint']);
    gulp.watch(paths.src.haml, ['haml']);
});

gulp.task('default', ['watch']);
