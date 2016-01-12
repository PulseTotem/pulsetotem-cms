var moment = require('moment');

module.exports = function (grunt) {
  'use strict';

  // load extern tasks
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-exec');

  // tasks
  grunt.initConfig({

    config : grunt.file.readJSON('database/config/config.json'),
    
// ---------------------------------------------
//                          build and dist tasks
// ---------------------------------------------
    copy: {
      buildDatabase : {
        files: 	[{expand: true, cwd: 'database', src: ['**'], dest: 'build/database/'}]
      },
      buildCMSConfigInfosFile: {
        files: 	[{'build/cms_config.json': 'scripts/core/cms_config.json'}]
      },

      distDatabase : {
        files: 	[{expand: true, cwd: 'database', src: ['**'], dest: 'dist/database/'}]
      },
      distCMSConfigInfosFile: {
        files: 	[{'dist/cms_config.json': 'scripts/core/cms_config.json'}]
      },

      testDatabase : {
        files: 	[{expand: true, cwd: 'database', src: ['**'], dest: 'buildTests/database/'}]
      },
      testCMSConfigInfosFile: {
        files: 	[{'buildTests/cms_config.json': 'scripts/core/cms_config.json'}]
      },

      migrationFile: {
        files: 	[{'database/migrations/<%= grunt.option("fileName") %>.js': 'database/config/migrationFile-sample.js'}]
      }
    },

    exec: {
      doMigration: './node_modules/sequelize-cli/bin/sequelize db:migrate --config="./database/config/config.json" --migrations-path="./database/migrations"',
      undoMigration: './node_modules/sequelize-cli/bin/sequelize db:migrate:undo --config="./database/config/config.json" --migrations-path="./database/migrations"',
      generateModels: './node_modules/sequelize-auto/bin/sequelize-auto -o "./database/models" -d <%= config.development.database %> -h <%= config.development.host %> -u <%= config.development.username %> -p <%= config.development.port %> -x <%= config.development.password %> -e <%= config.development.dialect %>'
    },

    typescript: {
      build: {
        src: [
          'scripts/CMS.ts'
        ],
        dest: 'build/CMS.js',
        options: {
          module: 'commonjs',
          basePath: 'scripts'
        }
      },

      dist: {
        src: [
          'scripts/CMS.ts'
        ],
        dest: 'dist/CMS.js',
        options: {
          module: 'commonjs',
          basePath: 'scripts'
        }
      },

      test: {
        src: [
          'tests/**/*.ts'
        ],
        dest: 'buildTests/Test.js'
      }
    },

    express: {
      options: {
        port: 8000
      },
      build: {
        options: {
          script: 'build/CMS.js',
          args: ["loglevel=debug"]
        }
      },
      dist: {
        options: {
          script: 'dist/CMS.js',
          args: ["loglevel=error"],
          node_env: 'production'
        }
      }
    },
// ---------------------------------------------

// ---------------------------------------------
//                                 develop tasks
// ---------------------------------------------
    watch: {
      express: {
        files:  [ 'build/CMS.js' ],
        tasks:  [ 'express:build' ],
        options: {
          spawn: false
        }
      },

      developServer: {
        files: ['scripts/**/*.ts', 'database/**/*.js'],
        tasks: ['typescript:build']
      }
    },
// ---------------------------------------------

// ---------------------------------------------
//                                 doc tasks
// ---------------------------------------------
    yuidoc: {
      compile: {
        name: 'CMS',
        description: 'CMS.',
        version: '0.0.1',
        url: 'http://example.com',
        options: {
          extension: '.ts, .js',
          paths: ['scripts/'],
          outdir: 'doc/'
        }
      }
    },
// ---------------------------------------------

// ---------------------------------------------
//                                 test tasks
// ---------------------------------------------
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          colors: true
        },
        src: ['buildTests/Test.js']
      }
    },
// ---------------------------------------------

// ---------------------------------------------
//                                    clean task
// ---------------------------------------------
    clean: {
      build: ['build/'],
      heroku: ['heroku/'],
      dist: ['dist/'],
      doc: ['doc/'],
      test: ['buildTests/'],
      buildDBInit: ['buildDBInit/'],
      models: ["models/*.js", "!models/index.js"]
    }
// ---------------------------------------------
  });

  // register tasks
  grunt.registerTask('default', ['build']);

  grunt.registerTask('build', function () {
    grunt.task.run(['clean:build']);

    grunt.task.run(['copy:buildDatabase', 'copy:buildCMSConfigInfosFile', 'typescript:build']);
  });

  grunt.registerTask('develop', function() {
    grunt.task.run(['build', 'express:build', 'watch']);
  });

  grunt.registerTask('dist', function () {
    grunt.task.run(['clean:dist']);

    grunt.task.run(['copy:distDatabase', 'copy:distCMSConfigInfosFile', 'typescript:dist']);
  });

  grunt.registerTask('test', function() {
    grunt.task.run(['clean:test']);

    grunt.task.run(['copy:testDatabase', 'copy:testCMSConfigInfosFile', 'typescript:test', 'mochaTest:test']);
  });

  grunt.registerTask('migration', 'Task to manage database migration.', function(arg, arg2) {
    if (arguments.length === 0) {
      grunt.log.writeln('Usage : grunt ' + this.name + ":action");
      grunt.log.writeln('Actions are "new" or "do" or "undo".');
    } else {
      switch(arg) {
        case 'new' :
          var migrationName = "migration"
          if(typeof(arg2) != "undefined" && arg2 != null) {
            migrationName = arg2;
          }

          var now = new moment();
          var fileName = now.format("YYYYMMDDHHmmss_") + migrationName;
          grunt.option("fileName", fileName);
          grunt.task.run(['copy:migrationFile']);
          break;
        case 'do' :
          grunt.task.run(['exec:doMigration', 'clean:models', 'exec:generateModels']);
          break;
        case 'undo' :
          grunt.task.run(['exec:undoMigration', 'clean:models', 'exec:generateModels']);
          break;
        default :
          grunt.log.writeln('Action "' + arg + '" doesn\'t exist.');
      }
    }
  });

  grunt.registerTask('doc', ['clean:doc', 'yuidoc']);
}