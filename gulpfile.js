import { src, dest, series, parallel, watch } from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';
import fileinclude from 'gulp-file-include';
import webp from 'gulp-webp';
import { deleteAsync } from 'del';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import named from 'vinyl-named';

const sass = gulpSass(dartSass);
const sync = browserSync.create();

// Удаляем старые файлы из папки dist
function clean() {
  return deleteAsync(['./dist/**/*']);
}

// Копирование шрифтов
function copyFonts() {
  return src('./src/fonts/**/*.{woff,woff2,ttf,eot,svg,otf}', {
    encoding: false,
  })
    .pipe(dest('./dist/fonts'));
}

// Компиляция SCSS
function compileSass() {
  return src('./src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    // .pipe(cleanCSS({ level: 2 }))   // раскомментируй для продакшена
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./dist/css'))
    .pipe(sync.stream());
}

// Компиляция JS с Webpack
async function compileJs() {
  const { default: webpackConfig } = await import('./webpack.config.js');

  return src('./src/js/main.js')
    .pipe(named()) // Назначаем имя каждому файлу
    .pipe(webpackStream(webpackConfig, webpack))
    .on('error', function (err) {
      console.error('WEBPACK ERROR:', err.toString());
      this.emit('end');
    })
    .pipe(dest('./dist/js'))
    .pipe(sync.stream());
}

// Оптимизация изображений
function optimizeImages() {
  return src('./src/images/**/*.{jpg,jpeg,png,gif,svg}')
    .pipe(webp({ quality: 80 }))
    .pipe(imagemin())
    .pipe(dest('./dist/images'));
}

// Копирование HTML с поддержкой includes
function copyHtml() {
  return src('./src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(dest('./dist'))
    .pipe(sync.stream());
}

// Наблюдение за файлами
function watchFiles() {
  sync.init({
    server: './dist',
    notify: false,
    ui: false,
  });

  watch('./src/scss/**/*.scss', compileSass);
  watch('./src/js/**/*.js', compileJs);
  watch('./src/images/**/*', optimizeImages);
  watch(['./src/*.html', './src/html_partials/**/*.html'], copyHtml);
}

// ──────────────────────────────────────────────
// Задачи
// ──────────────────────────────────────────────

const build = series(
  compileSass,
  compileJs,
  optimizeImages,
  copyHtml,
  copyFonts
);

export { clean, copyFonts, compileSass, compileJs, optimizeImages, copyHtml };

export const dev = series(clean, copyFonts, build, watchFiles);

// По умолчанию запускаем разработку
export default dev;
