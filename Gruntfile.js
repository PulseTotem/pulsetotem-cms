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
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-bumpup');

  // tasks
  grunt.initConfig({

    config : grunt.file.readJSON('database/config/config.json'),
    env : {
      dev: {
        NODE_ENV: 'development'
      },
      test: {
        NODE_ENV: 'test'
      }
    },

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

      testDatabase : {
        files: 	[{expand: true, cwd: 'database', src: ['**'], dest: 'buildTests/database/'}]
      },
      testCMSConfigInfosFile: {
        files: 	[{'buildTests/cms_config.json': 'scripts/core/cms_config_tests.json'}]
      },

      migrationFile: {
        files: 	[{'database/migrations/<%= grunt.option("fileName") %>.js': 'database/config/migrationFile-sample.js'}]
      }
    },

    exec: {
      doMigration: './node_modules/sequelize-cli/bin/sequelize db:migrate --config="./database/config/config.json" --migrations-path="./database/migrations"',
      doMigrationTests: './node_modules/sequelize-cli/bin/sequelize db:migrate --config="./buildTests/database/config/config.json" --migrations-path="./buildTests/database/migrations"',
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
          'tests/<%= grunt.option("testFile") %>'
        ],
        dest: 'buildTests/scripts/<%= grunt.option("testResultFile") %>',
        options: {
          module: 'commonjs',
          basePath: 'tests'
        }
      },
      jenkins: {
        src: [
            'tests/**/*.ts'
        ],
        dest: 'buildTests/test.js'
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
          colors: true,
          captureFile: 'buildTests/result.txt'
        },
        src: ['buildTests/**/*.js']
      },
      jenkins: {
        options: {
          reporter: 'mocha-jenkins-reporter',
          quiet: false,
          reporterOptions: {
            "junit_report_name": "Tests",
            "junit_report_path": "buildTests/report.xml",
            "junit_report_stack": 1
          }
        },
        src: ['buildTests/**/*.js']
      }
    },

    mocha_istanbul: {
      coverage: {
        src: 'buildTests/', // a folder works nicely
        options: {
          mask: '*.js',
          root: 'buildTests/',
          reportFormats: ['cobertura', 'html'],
          coverageFolder: 'buildTests/coverage'
        }
      },
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
    },
// ---------------------------------------------

// ---------------------------------------------
//                                    bump task
// ---------------------------------------------
    bumpup: 'package.json'
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

    grunt.task.run(['copy:distDatabase', 'typescript:dist']);
  });

/*  grunt.registerTask('test', function() {
    grunt.task.run(['clean:test']);

    grunt.task.run(['copy:testDatabase', 'copy:testCMSConfigInfosFile', 'typescript:test', 'mochaTest:test']);
  });
*/

  var testNames = [];
  var testId = null;

  grunt.registerTask('nextTest', function() {
    if(testId == null) {
      testId = 0;
    } else {
      testId++;
    }

    if(testId < testNames.length) {
      var testFileNames = testNames[testId];
      grunt.option('testFile', testFileNames[0]);
      grunt.option('testResultFile', testFileNames[1]);
      grunt.task.run(['typescript:test']);
      grunt.task.run(['nextTest']);
    } else {
      grunt.task.run(['mochaTest:test']);
    }
  });

  grunt.registerTask('test', function(name) {
    grunt.task.run(['env:test','clean:test', 'copy:testDatabase', 'copy:testCMSConfigInfosFile']);
    grunt.task.run(['exec:doMigrationTests']);

    if(arguments.length == 0) {
      var tests = grunt.file.expand('tests/**/*.ts');
      tests.forEach(function (testFile) {
        var testNameSplitted = testFile.split('/');

        var testTSName = testNameSplitted[testNameSplitted.length - 1];

        var testName = testTSName.substr(0, testTSName.length - 3);

        var testFileTS = testNameSplitted.slice(1).join('/');
        var testFileJS = testNameSplitted.slice(1, -1).join('_') + '_' + testName + '.js';

        if (testName != "BaseTest") {
          testNames.push([testFileTS, testFileJS]);
        }
      });
    } else {
      var testNameSplitted = ('tests/' + name).split('/');

      var testTSName = testNameSplitted[testNameSplitted.length - 1];

      var testName = testTSName.substr(0, testTSName.length - 3);

      var testFileTS = testNameSplitted.slice(1).join('/');
      var testFileJS = testNameSplitted.slice(1, -1).join('_') + '_' + testName + '.js';

      if (testName != "BaseTest") {
        testNames.push([testFileTS, testFileJS]);
      }
    }

    grunt.task.run(['nextTest']);
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
          var generateModels = "false";
          if(typeof(arg2) != "undefined" && arg2 != null) {
            generateModels = arg2;
          }
          if(generateModels == "true") {
            grunt.task.run(['exec:doMigration', 'clean:models', 'exec:generateModels']);
          } else {
            grunt.task.run(['exec:doMigration']);
          }
          break;
        case 'undo' :
          var generateModels = "false";
          if(typeof(arg2) != "undefined" && arg2 != null) {
            generateModels = arg2;
          }
          if(generateModels == "true") {
            grunt.task.run(['exec:undoMigration', 'clean:models', 'exec:generateModels']);
          } else {
            grunt.task.run(['exec:undoMigration']);
          }
          break;
        default :
          grunt.log.writeln('Action "' + arg + '" doesn\'t exist.');
      }
    }
  });

  grunt.registerTask('doc', ['clean:doc', 'yuidoc']);
  grunt.registerTask('jenkins', ['env:test','clean:test', 'copy:testDatabase', 'copy:testCMSConfigInfosFile','exec:doMigrationTests','typescript:jenkins','mochaTest:jenkins','mocha_istanbul:coverage']);
}