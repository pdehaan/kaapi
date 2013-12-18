module.exports = function (grunt) {

  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var Mocha = require('mocha');
  var requirejs = require('requirejs');

  var path = require('path');

  var glob = grunt.file.glob;
  var isTravis = (process.env.TRAVIS === 'true');

  var defaults = {
    'base': '',
    'glob': 'specs/**/*.spec.js',
    'ui': 'bdd',
    'reporter': 'spec',
    'require': {
      'base': 'public'
    }
  };

  // Attach globals to all the contexts
  function fixContext (ctx) {

    // make "requirejs" a global in specs running in nodejs
    ctx.requirejs = ctx.require = requirejs;
    ctx.nodeRequire = require;

    // make chai functions available
    ctx.should = chai.should();
    ctx.expect = chai.expect;

    // make sinon available
    ctx.sinon = sinon;

    // make requirejs methods available
    ctx.define = requirejs.define;

    // Specs are in nodejs
    ctx.isNode = true;

    // Specs are on travis
    ctx.isTravis = isTravis;
  }

  function onSuite (suite) {
    suite.on('beforeEach', function (hook) {
      fixContext(hook.ctx);
    });
  }

  function patchContext (mocha) {

    mocha.suite.on('pre-require', function (context) {

      // fix the main suite context first
      fixContext(context);

      // also make all this stuff available
      // on beforeEach of these suites
      mocha.suite.on('suite', onSuite);
    });
  }

  function NodeRunner () {

    // default options
    var options = this.options(defaults);

    // Async task here
    var done = this.async();

    // Create a new spec-runner
    var mocha = new Mocha();

    // Configure Mocha UI & Reporter
    mocha.ui(options.ui);
    mocha.reporter(options.reporter);

    // find modules in the app folder
    var baseUrl = path.resolve(options.base, options.require.base);
    requirejs.config({
      'baseUrl': baseUrl
    });

    // Path the context
    patchContext(mocha);

    // populate files
    var globRule = path.resolve(options.base, options.glob);
    mocha.files = glob.sync(globRule);

    // add support for grepping specs
    if (this.args.length && mocha.files.length) {
      mocha.grep(this.args[0]);
    }

    // Run it
    mocha.run(function (count) {

      // Stop fataly on any failed specs
      if (count) {
        grunt.fatal(count + ' failures.');
      }

      done();
    });
  }

  grunt.registerTask('kaapi/node', NodeRunner);
};