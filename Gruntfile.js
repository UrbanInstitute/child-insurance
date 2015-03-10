module.exports = function(grunt) {

  // load grunt-* modules from package.json
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    concat: {
      css: {
        src: ['app/css/*.css'],
        dest: 'app/bundle.css',
      },
    },

    watch: {
      html: {
        files: [
          './app/index.html'
        ]
      },
      scripts : {
        "files" : [
          './app/js/*.js'
        ],
        "tasks" : ['browserify']
      },
      css: {
        files: ["./app/css/*.css"],
        tasks: ["concat:css"]
      },
      options: {
        livereload: true
      }
    },

    browserify : {
      dist : {
        files : {
          'app/bundle.js' : ['app/js/main.js'],
        }
      }
    },

    shell: {
        options: {
            stderr: false
        },
        deploy: {
            command: 'sh ./deploy'
        }
    },

    browserSync: {
      bsFiles: {
        src: [
          './app/css/*',
          './app/index.html',
          './app/js/*'
        ]
      },
      options: {
        notify: false,
        watchTask: true,
        server: {
          baseDir: "./app/",
          index: "index.html"
        }
      }
    }

  });

  var prep = [
    'browserify',
    'concat:css'
  ];

  var watch = [
    'browserSync',
    'watch'
  ];

  grunt.registerTask('default', prep.concat(watch));

  grunt.registerTask('deploy', prep.concat(['shell']));

};