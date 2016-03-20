
// generated on 2016-03-20 using generator-library 1.0.0
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const DEV_DIR = 'dev';
const DIST_DIR = 'dist';


gulp.task('styles:sandbox', () => {
  return gulp.src(DEV_DIR+'/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('styles:watch', () => {
  return gulp.src(DEV_DIR+'/turtleJS/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(DEV_DIR+'/turtleJS'))
    .pipe(reload({stream: true}));
});

gulp.task('styles:dist', () => {
  return gulp.src(DEV_DIR+'/turtleJS/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(DIST_DIR+'/turtleJS'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts:sandbox', () => {
  return gulp.src(DEV_DIR+'/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts:watch', () => {
  return gulp.src(DEV_DIR+'/turtleJS/**/*.babel.js')
    .pipe($.rename({
      basename: "turtleJS",
      extname: ".js"
    }))
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/turtleJS'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts:dist', () => {
  return gulp.src(DEV_DIR+'/turtleJS/**/*.babel.js')
    .pipe($.rename({
      basename: "turtleJS",
      extname: ".js"
    }))
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(DIST_DIR+'/turtleJS'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint(DEV_DIR+'/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));


gulp.task('move', ['styles:dist', 'scripts:dist'], () => {
  return gulp.src(DEV_DIR+'/turtleJS/*.js')
    .pipe($.useref({searchPath: [DEV_DIR + '/turtleJS']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(DIST_DIR+'/turtleJS'));
});

gulp.task('images', () => {
  return gulp.src(DEV_DIR+'/img/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(DIST_DIR+'/images'));
});

gulp.task('extras', () => {
  return gulp.src([
    DEV_DIR+'/*.*',
    '!'+DEV_DIR+'/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest(DIST_DIR));
});

gulp.task('clean', del.bind(null, ['.tmp', DIST_DIR]));

gulp.task('serve', ['styles:sandbox', 'scripts:sandbox', 'styles:watch', 'scripts:watch'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', DEV_DIR],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    DEV_DIR+'/*.html',
    DEV_DIR+'/images/**/*'
  ]).on('change', reload);

  gulp.watch(DEV_DIR+'/turtleJS/**/*.scss', ['styles:watch']);
  gulp.watch(DEV_DIR+'*.scss', ['styles:sandbox']);
  gulp.watch(DEV_DIR+'/*.js', ['scripts:sandbox']);
  gulp.watch(DEV_DIR+'/turtleJS/**/*.js', ['scripts:watch']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [DIST_DIR]
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(DEV_DIR+'/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});


gulp.task('build', ['lint', 'move', 'images', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});