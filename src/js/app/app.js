var app = angular.module( 'app', [ 'ngResource', 'ngSanitize', 'ngClipboard' ] );

/**
 * Config
 */
app.config(
    [
        'ngClipProvider',
        function( ngClipProvider )
        {
            ngClipProvider.setPath( 'src/js/libs/ZeroClipboard.swf' );
        }
    ]
);

/**
 * Data service
 */
app.service(
    'data',
    [
        '$http',
        function( $http )
        {
            // Data
            var data      = {};
            data.inputs   = null;
            data.defaults = {
                paragraphes : {
                    min   : 0,
                    max   : 10,
                    count : 14
                },
                options :
                {
                    name       : false,
                    html       : false,
                    nanana     : false,
                    line_break : true
                }
            };
            data.params = {
                movies      : [],
                characters  : [],
                paragraphes : {
                    min   : data.defaults.paragraphes.min,
                    max   : data.defaults.paragraphes.max,
                    count : data.defaults.paragraphes.count
                },
                options :
                {
                    name       : data.defaults.options.name,
                    html       : data.defaults.options.html,
                    nanana     : data.defaults.options.nanana,
                    line_break : data.defaults.options.line_break
                },
                min_text_length : 99999,
                max_text_length : 0
            };

            // JSON request
            var request = $http.get( 'data/punch_lines.json' );
            request.success( function( result )
            {
                data.inputs = result;
                data.init();
            } );
            request.error( function()
            {
                console.log( 'error' );
            } );

            // Prepare
            data.init = function()
            {
                var key   = null,
                    value = null;

                // Movies
                for( key in data.inputs.movies )
                {
                    value       = _.clone( data.inputs.movies[ key ] );
                    value.value = true;
                    data.params.movies.push( value );
                }

                // Characters
                for( key in data.inputs.characters )
                {
                    value          = _.clone( data.inputs.characters[ key ] );
                    value.value    = true;
                    value.disabled = false;
                    data.params.characters.push( value );
                }

                // Characters in movies
                for( key in data.inputs.movies )
                {
                    var movie = data.inputs.movies[ key ];
                    movie.characters = [];

                    for( var _key in data.inputs.texts )
                    {
                        var text = data.inputs.texts[ _key ];

                        if( text.id_movie === movie.id && movie.characters.indexOf( text.id_character ) === -1 )
                            movie.characters.push( text.id_character );
                    }
                }

                // Texts lengths
                for( key in data.inputs.texts )
                {
                    var _text = data.inputs.texts[ key ];

                    if( _text.text.length < data.params.min_text_length )
                        data.params.min_text_length = _text.text.length;
                    if( _text.text.length > data.params.max_text_length )
                        data.params.max_text_length = _text.text.length;
                }

                data.update();
            };

            // Update
            data.update = function()
            {
                // Disable characters
                for( var key in data.params.characters )
                {
                    var character = data.params.characters[ key ];
                    character.disabled = true;

                    for( var _key in data.inputs.movies )
                    {
                        if( data.params.movies[ _key ].value && data.inputs.movies[ _key ].characters.indexOf( character.id ) !== -1 )
                            character.disabled = false;
                    }
                }

                // Generate ipsum
                data.generate_ipsum();
            };

            data.generate_ipsum = function()
            {
                var texts      = [],
                    texts_step = Math.ceil( data.params.max_text_length / data.defaults.paragraphes.max ),
                    count      = data.params.paragraphes.count,
                    id_movies  = _.map( data.params.movies, function( movie )
                    {
                        return movie.value ? movie.id : null;
                    } ),
                    id_characters = _.map( data.params.characters, function( character )
                    {
                        return character.value ? character.id : null;
                    } );

                // Nanana BATMAN!
                if( data.params.options.nanana )
                {
                    while( count-- )
                    {
                        var size        = ( data.params.paragraphes.min * texts_step ) + Math.random() * ( ( data.params.paragraphes.max - data.params.paragraphes.min ) * texts_step ),
                            words_count = Math.round( size / 14 ),
                            text        = [];

                        while( words_count-- )
                        {
                            if( !text.length )
                                text.push( 'Na na na' );
                            else
                            {
                                if( Math.random() < 0.2 )
                                    text.push( 'Batman!' );
                                else
                                    text.push( 'na na na' );
                            }
                        }

                        texts.push( text.join(' ') );
                    }
                }

                // Normal version
                else
                {
                    // Filter texts
                    for( var key in data.inputs.texts )
                    {
                        var text = data.inputs.texts[ key ];

                        // In movies
                        if( id_movies.indexOf( text.id_movie ) !== -1 )
                        {
                            // In characters
                            if( id_characters.indexOf( text.id_character ) !== -1 )
                            {
                                // Size
                                if( text.text.length > data.params.paragraphes.min * texts_step && text.text.length < data.params.paragraphes.max * texts_step )
                                {
                                    texts.push( text );
                                }
                            }
                        }
                    }

                    // Texts founds
                    if( texts.length )
                    {
                        // Shuffle
                        var texts_tmp = _.shuffle( texts );

                        // Paragraphes count
                        texts_tmp = texts_tmp.slice( 0, data.params.paragraphes.count );

                        // Reformat
                        texts_tmp = _.map( texts_tmp, function( text )
                        {
                            var new_text = [];

                            // HTML
                            if( data.params.options.html )
                                new_text.push( '<p>' );

                            // Author
                            if( data.params.options.name )
                            {
                                var author = _.find( data.inputs.characters, function( character )
                                {
                                    return character.id === text.id_character;
                                } );
                                new_text.push( author.name + ': ' );
                            }

                            // Text
                            // text.text = text.text.replace( /[\w]+/g, Math.random() < 0.2 ? 'Batman' : 'na na' );
                            new_text.push( text.text );

                            // HTML
                            if( data.params.options.html )
                                new_text.push( '</p>' );

                            return new_text.join( '' );
                        } );

                        // Respect count
                        texts = [];
                        while( count-- )
                            texts.push( texts_tmp[ count % texts_tmp.length ] );
                    }
                }

                texts = texts.join( data.params.options.line_break ? '\n\n' : '\n' );
                data.params.value = texts;
            };

            // Check all
            data.check_all = function( target )
            {
                if( target === 'movies' )
                    target = data.params.movies;
                else
                    target = data.params.characters;

                for( var key in target )
                    target[ key ].value = true;

                data.update();
            };

            // Uncheck all
            data.uncheck_all = function( target )
            {
                if( target === 'movies' )
                    target = data.params.movies;
                else
                    target = data.params.characters;

                for( var key in target )
                    target[ key ].value = false;

                data.update();
            };

            // Reset
            data.reset = function( target )
            {
                if( target === 'paragraphes' )
                {
                    data.params.paragraphes.min   = data.defaults.paragraphes.min;
                    data.params.paragraphes.max   = data.defaults.paragraphes.max;
                    data.params.paragraphes.count = data.defaults.paragraphes.count;
                }
                else
                {
                    data.params.options.name       = data.defaults.options.name;
                    data.params.options.html       = data.defaults.options.html;
                    data.params.options.nanana     = data.defaults.options.nanana;
                    data.params.options.line_break = data.defaults.options.line_break;
                }

                data.update();
            };

            return data;
        }
    ]
);

/**
 * Controller
 */
app.controller(
    'main',
    [
        '$scope',
        '$timeout',
        'data',
        function( $scope, $timeout, data )
        {
            $scope.params      = data.params;
            $scope.defaults    = data.defaults;
            $scope.update      = data.update;
            $scope.check_all   = data.check_all;
            $scope.uncheck_all = data.uncheck_all;
            $scope.reset       = data.reset;
            $scope.copy_label  = 'Copy to clipboard';

            $scope.reset_copy_label = function()
            {
                $scope.copy_label = 'Copy to clipboard';
            };

            $scope.get_copy = function()
            {
                $scope.$apply( function()
                {
                    $scope.copy_label = 'Copied!';
                } );

                return data.params.value;
            };

            $scope.$watch( 'params.paragraphes.min', function( new_value )
            {
                new_value = parseInt( new_value );
                if( data.params.paragraphes.max < new_value + 1 && data.params.paragraphes.max < data.defaults.paragraphes.max )
                    data.params.paragraphes.max = new_value + 1;
            } );

            $scope.$watch( 'params.paragraphes.max', function( new_value )
            {
                new_value = parseInt( new_value );
                if( data.params.paragraphes.min > new_value - 1 && data.params.paragraphes.min > data.defaults.paragraphes.min )
                    data.params.paragraphes.min = new_value - 1;
            } );
        }
    ]
);
