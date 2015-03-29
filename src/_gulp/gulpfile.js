var gulp         = require( 'gulp' ),
    concat       = require( 'gulp-concat' ),
    uglify       = require( 'gulp-uglify' ),
    watch        = require( 'gulp-watch' ),
    minify_css   = require( 'gulp-minify-css' ),
    autoprefixer = require( 'gulp-autoprefixer' );

var path = '../';

/**
 * JS
 */
gulp.task( 'js' , function()
{
    gulp.src([
        path + 'js/libs/underscore.min.js',
        path + 'js/libs/ZeroClipboard.min.js',
        path + 'js/libs/angular.min.js',
        path + 'js/libs/angular-resource.min.js',
        path + 'js/libs/angular-sanitize.min.js',
        path + 'js/libs/ng-clip.min.js',
        path + 'js/app/app.js',
    ])
    .pipe( concat( 'script.min.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( path + 'js/' )) ;
});

/**
 * WATCH
 */
gulp.task( 'watch', [ 'js' ],function()
{
    // JS
    watch( [
        path + 'js/**',
        '!' + path + 'js/script.min.js'
    ], function()
    {
        gulp.start( 'js' );
    } );
});


gulp.task( 'default', [ 'js' ] );
