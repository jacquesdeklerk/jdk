// generated on 2016-04-20 using generator-webapp 2.0.0
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';


// GULPICON
var iconConfig = require('./src/assets/svg/config.js');
iconConfig.dest = 'release/assets/svg/output';



const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('src/assets/styles/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'IE 9']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('release/assets/styles'))
    .pipe(reload({stream: true}));
});


gulp.task('scripts', () => {

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: 'src/assets/scripts/main.js',
    debug: true
  });

  // Babel transform
  b.transform(babelify.configure({
    sourceMapRelative: 'src/assets/scripts',
    presets: ['es2015']
  }));

  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe($.if(argv.production, $.sourcemaps.init({loadMaps: true})))
    // Add transformation tasks to the pipeline here.
    //.pipe($.babel())
    .pipe($.if(argv.production, $.uglify()))
    .on('error', gutil.log)
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('release/assets/scripts'))
    .pipe(reload({stream: true}));


  // return gulp.src('release/assets/scripts/**/*.js')
  //   .pipe($.plumber())
  //   .pipe($.sourcemaps.init())
  //   .pipe($.babel())
  //   .pipe($.sourcemaps.write('.'))
  //   .pipe(gulp.dest('.tmp/scripts'))
  //   .pipe(reload({stream: true}));
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

gulp.task('lint', lint('src/assets/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('compile', (cb) => {
	runWintersmith.build(function(){
    // Log on successful build
    gutil.log('Wintersmith has finished building!');

    // Tell gulp task has finished
    cb();
  });
});

//
// Preview task
//
gulp.task('preview', function() {
  // Tell Wintersmith to run in preview mode
  runWintersmith.preview();
});

gulp.task('html', ['styles', 'scripts'], () => {

  if(argv.production) {
    return gulp.src('release/**/*.html')
      .pipe($.useref({searchPath: ['release', '.']}))
      .pipe($.if('*.js', $.uglify()))
      .pipe($.if('*.css', $.cssnano()))
      .pipe($.if('*.js', $.rev()))
      .pipe($.if('*.css', $.rev()))
      .pipe($.revReplace())
      .pipe($.if('*.html', inlinesource()))
      .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
      .pipe(gulp.dest('release'));
  }

  return false;

});


// gulp.task('rev', () => {
//
//   var revAll = new RevAll();
//
//   return gulp.src('release/**')
//       .pipe(revAll.revision())
//       .pipe(gulp.dest('release'));
// });


gulp.task('revision', function(){

  if(argv.production) {
    return gulp.src(['release/**/*.css', '!release/**/*.critical.css'])
      .pipe($.rev())
      .pipe(gulp.dest('release'))
      .pipe($.rev.manifest())
      .pipe(gulp.dest('release'));
  }
  else {
    return false;
  }
});

gulp.task('revreplace', ['revision'], function(){

  if(argv.production) {
    var manifest = gulp.src('./release/rev-manifest.json');

    return gulp.src('release/**/*.html')
      .pipe($.revReplace({manifest: manifest}))
      .pipe(gulp.dest('release'));

  }
  else {
    return false;
  }
});


gulp.task('bannerimages', () => {
  return gulp.src('src/assets/images/banners/**/*')
    .pipe(responsiveImg({
      '*': [
        {
          width: 640,
          suffix: '-640'
        },
        {
          width: 960,
          suffix: '-960'
        },
        {
          width: 1280,
          suffix: '-1280'
        },
        {
          width: 1620,
          suffix: '-1620'
        },
        {
          width: 1920,
          suffix: '-1920'
        },
        {
          width: 2420,
          suffix: '-2420'
        }
      ]
    }))
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('release/assets/images/banners'));
});


gulp.task('images', () => {
  return gulp.src(['src/assets/images/**/*', '!src/assets/images/banners/**/*'])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('release/assets/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}',
		function (err) {
			console.log(err);
		})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});


gulp.task('modernizr', () => {
  // return gulp.src([
  //   'bower_components/modernizr/modernizr.js'
  // ], {
  //   dot: true
  // })
  // .pipe($.if(argv.production, $.uglify()))
  // .pipe(gulp.dest('release/assets/scripts/vendor'));

  return gulp.src(['src/assets/scripts/**/*.js', 'src/assets/styles/**/*.scss'])
    .pipe($.modernizr({
      options: [
        'setClasses'
      ],
      excludeTests: [
        'hidden'
      ]
    }))
    .pipe($.if(argv.production, $.uglify()))
    .pipe(gulp.dest('release/assets/scripts/vendor/'));

});

gulp.task('enhance', () => {
  return gulp.src([
    'src/assets/scripts/utils/enhance.js'
  ], {
    dot: true
  })
  .pipe($.if(argv.production, $.uglify()))
  .pipe(gulp.dest('release/assets/scripts/utils'));
});

gulp.task('grunticon', gulpicon( glob.sync('./src/assets/svg/min/**/*.svg'), iconConfig));

gulp.task('svgmin', () => {
  return gulp.src('src/assets/svg/src/**/*.svg')
    .pipe($.cache($.imagemin({
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('src/assets/svg/min'));
});

gulp.task('icons', (callback) => {
  return runSequence(
    'svgmin',
    'grunticon',
    callback
  );
});

gulp.task('extras', () => {
  return gulp.src([
    'src/assets/videos/*.*'
  ], {
    dot: true
  }).pipe(gulp.dest('release/assets/videos'));
});


gulp.task('clean', del.bind(null, ['.tmp', 'release']));

gulp.task('serve', ['build'], () => {

  browserSync({
    notify: false,
    port: 9999,
    proxy: {
      target: 'http://192.168.99.99.xip.io'
    }
  });

  gulp.watch([
    'release/**/*.html',
    'release/assets/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch(['config.json', 'src/**/*.{jade,md,json,coffee}'], ['compile']);
  gulp.watch('src/assets/styles/**/*.scss', ['styles']);
  gulp.watch(['src/assets/scripts/**/*.js', '!src/assets/scripts/utils/enhance.js'], ['scripts']);
  gulp.watch('src/assets/fonts/**/*', ['fonts']);
  gulp.watch('src/assets/svg/**/*', ['icons']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
  gulp.watch('src/assets/scripts/utils/enhance.js', ['enhance']);
  gulp.watch(['src/assets/images/**/*', '!src/assets/images/banners/**/*'], ['images']);
  gulp.watch('src/assets/images/banners/**/*', ['bannerimages']);
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

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('src/styles/**/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('src/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('size', () => {
  return gulp.src('release/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build', [ 'clean'], (callback) => {

  runSequence('compile',
              ['modernizr', 'enhance'],
              ['lint', 'html', 'images', 'bannerimages', 'fonts', 'icons', 'extras'],
              'revreplace',
              'size',
              callback);

  //return gulp.src('release/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
