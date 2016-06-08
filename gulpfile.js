var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');


var buildControl = require('build-control').BuildControl;

var bc = new buildControl({
  branch: 'dist',
  remote: {
   repo: 'git@github.com:jacquesdeklerk/jacquesdeklerk.github.io.git',
   branch: 'master'
 },
});

var $ = gulpLoadPlugins();



gulp.task('deploy', () => {
  return bc.run();
});
