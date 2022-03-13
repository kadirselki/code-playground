const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const uglify = require("gulp-uglify-es").default;
const concat = require('gulp-concat');
const minifyCSS = require('gulp-clean-css');


gulp.task('browser-sync', function(){
	browserSync.init({
		notify: false,
        server: {
            baseDir: "./"
        }
	});

	gulp.watch('./assets/scss/*.scss', gulp.parallel('css'));
	gulp.watch('./assets/js/dev/*.js', gulp.parallel('js'));
	gulp.watch("./*.html").on('change', browserSync.reload);
});

gulp.task('css',function(){
	return gulp.src(['./assets/scss/main.scss'])
		.pipe(plumber([{ errorHandler: false }]))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(minifyCSS())
		.pipe(gulp.dest('./assets/css'))
		.pipe(browserSync.stream());
});

gulp.task('js', function(){
	return gulp.src(['./assets/js/dev/plugins/codemirror.js', './assets/js/dev/main.js'])
		.pipe(plumber([{ errorHandler: false }]))
		.pipe(uglify())
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./assets/js/dist/'))
		.pipe(browserSync.stream());
});

gulp.task('default', gulp.parallel('css','js', 'browser-sync'));