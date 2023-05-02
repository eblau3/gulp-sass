//------------------------------------------------------------------------------------------------------------------------------------------------------
// Plugin
//------------------------------------------------------------------------------------------------------------------------------------------------------
import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-dart-sass';
import sassGlob from 'gulp-sass-glob-use-forward';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';
import cssnano from 'cssnano';
import purgecss from '@fullhuman/postcss-purgecss';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';
import del from 'del';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
// option
import debug from 'gulp-debug';
import replace from 'gulp-replace';

//------------------------------------------------------------------------------------------------------------------------------------------------------
// Path
//------------------------------------------------------------------------------------------------------------------------------------------------------
const dist = 'dist';

const paths = {
	html: {
		src: './src/**/*.{html,php}',
		dist: `./${dist}`,
	},
	styles: {
		src: './src/assets/sass/style.scss',
		dist: `./${dist}/assets/styles`,
	},
  utility: {
		src: './src/assets/sass/utility.scss',
		dist: `./${dist}/assets/styles`,
	},
	scripts: {
		src: './src/assets/scripts/**/*.js',
		dist: `./${dist}/assets/scripts`,
	},
	images: {
		src: './src/assets/images/**/*',
		dist: `./${dist}/assets/images`,
	},
	files: {
		src: './src/assets/files/**/*',
		dist: `./${dist}/assets/files`,
	}
}

//----------------------------------------------------------------------------------------------------
// Clean
//----------------------------------------------------------------------------------------------------
export const clean = () => del([`${dist}/assets`])

//----------------------------------------------------------------------------------------------------
// HTML
//----------------------------------------------------------------------------------------------------
export const html = () => {
	return gulp
		.src(paths.html.src)
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    //.pipe(replace('href="/', 'href="/test/'))
		//.pipe(replace('src="/', 'src="/test/'))
		.pipe(gulp.dest(paths.html.dist))
		.pipe(browserSync.stream())
}

//----------------------------------------------------------------------------------------------------
// Styles
//----------------------------------------------------------------------------------------------------
const purgecssOption = {
  content: [paths.html.src],
  defaultExtractor: content => {
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
    return broadMatches
  }
}

const cssnanoOption = {
  autoprefixer: false
}

export const styles = () => {
	return gulp
		.src(paths.styles.src, { sourcemaps: true })
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(sassGlob())
		.pipe(sass.sync({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(postcss([
      autoprefixer(),
      mqpacker()
    ]))
		.pipe(gulp.dest(paths.styles.dist, { sourcemaps: './map' }))
		.pipe(browserSync.stream())
}

//  production
export const stylesProd = () => {
	return gulp
		.src(paths.styles.src)
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(sassGlob())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([
      autoprefixer(),
      mqpacker(),
      cssnano(cssnanoOption)
    ]))
		.pipe(gulp.dest(paths.styles.dist))
		.pipe(browserSync.stream())
}

export const utility = () => {
	return gulp
		.src(paths.utility.src, { sourcemaps: true })
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(sassGlob())
		.pipe(sass.sync({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(postcss([
      purgecss(purgecssOption),
      mqpacker(),
      autoprefixer()
    ]))
		.pipe(gulp.dest(paths.utility.dist, { sourcemaps: './map' }))
		.pipe(browserSync.stream())
}

//  production
export const utilityProd = () => {
	return gulp
		.src(paths.utility.src)
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(sassGlob())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([
      purgecss(purgecssOption),
      autoprefixer(),
      mqpacker(),
      cssnano(cssnanoOption)
    ]))
		.pipe(gulp.dest(paths.utility.dist))
		.pipe(browserSync.stream())
}

//----------------------------------------------------------------------------------------------------
// Scripts
//----------------------------------------------------------------------------------------------------
export const scripts = () => {
	return gulp
		.src(paths.scripts.src)
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(
			babel({
				presets: ['@babel/preset-env'],
			})
		)
		.pipe(gulp.dest(paths.scripts.dist))
		.pipe(browserSync.stream())
}

//----------------------------------------------------------------------------------------------------
// Images
//----------------------------------------------------------------------------------------------------
export const images = () => {
	return gulp
		.src(paths.images.src)
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(gulp.dest(paths.images.dist))
		.pipe(browserSync.stream())
}

export const imagesProd = () => {
	return gulp
		.src(paths.images.src)
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(imagemin())
		.pipe(gulp.dest(paths.images.dist))
		.pipe(browserSync.stream())
}

//----------------------------------------------------------------------------------------------------
// Files
//----------------------------------------------------------------------------------------------------
export const files = () => {
	return gulp
		.src(paths.files.src)
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		.pipe(gulp.dest(paths.files.dist))
		.pipe(browserSync.stream())
}

//----------------------------------------------------------------------------------------------------
// Watch
//----------------------------------------------------------------------------------------------------
export const watchFiles = () => {
	gulp.watch(paths.html.src, gulp.series(html, utility))
	gulp.watch('./src/assets/sass/**/*.scss', gulp.series(styles, utility))
	gulp.watch(paths.scripts.src, gulp.series(scripts))
	gulp.watch(paths.images.src, gulp.series(images))
	gulp.watch(paths.files.src, gulp.series(files))
}

//----------------------------------------------------------------------------------------------------
// BrowawerSync
//----------------------------------------------------------------------------------------------------
export const browsersync = () => {
	browserSync({
		server: {
			baseDir: `./${dist}`,
		}
	})
}

//----------------------------------------------------------------------------------------------------
// Build
//----------------------------------------------------------------------------------------------------
export default gulp.series(clean, gulp.parallel(html, styles, utility, scripts, images, files), gulp.parallel(watchFiles, browsersync))
export const prod = gulp.series(clean, gulp.parallel(html, stylesProd, utilityProd, scripts, imagesProd, files),gulp.parallel(watchFiles, browsersync))