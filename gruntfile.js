/* This is Grunt's config file. All pipeline stuff goes here */
module.exports = function(grunt) {
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['gruntfile.js', 'index.js','js/**/*.js','!js/views/templates.js','!js/views/mainjs.js','!js/views/mpld3.v0.3.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    console: true,
                    module: true,
                    document: true
                },
            }
        },
        handlebars: {
            compile: {
                options: {
                    node: true,
                    namespace: 'Templates',
                    partialsUseNamespace: true,
                    processName: function(filePath) {
                        var file = filePath.replace(/.*\/(\w+)\.hbs/, '$1');
                        return file;
                    }
                },
                files:{
                    'js/views/templates.js': ['templates/*.hbs']
                }
            }
        },
        browserify: {
            'dist/js/PCA.js': ['index.js']
        },
        uglify: {
            my_target: {
                files: {
                    'dist/js/PCA.min.js': ['dist/js/PCA.js']
                }
            }
        },
        watch: {
          scripts: {
            files: ['index.js', '**/*.js','dist/*','js/*'],
            tasks: ['jshint', 'browserify', 'uglify'],
            options: {
              spawn: false,
            },
          },
        },
        'serve': {
		      'path': '/dist/index.html'
	       }
    });
    
    //Tasks
    grunt.registerTask('dist', ['jshint', 'handlebars','browserify','uglify']); //Generates dist folder
    
    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-serve');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    
    //Watchify
    grunt.loadNpmTasks('grunt-contrib-watch');
    
};
                     
        