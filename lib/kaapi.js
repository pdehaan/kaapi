'use strict';

var extend = require('node.extend');
var glob = require('mocha/node_modules/glob');
var Mocha = require('mocha');
var path = require('path');

var kaapiCoverage;
var context = require('./context');
var defaults = require('./defaults');

function fixOptions (options) {
  return extend({}, defaults, options);
}

function Kaapi (options) {
  options = this.options = fixOptions(options);
  if (options.browser) {
    this.initBrowser();
  } else {
    this.initNode();
  }
}

Kaapi.prototype = {

  'initNode': function () {
    var options = this.options;

    // Create a new spec-runner
    var runner = this.runner = new Mocha();

    // Configure Mocha UI & Reporter
    this.configure();

    // Load files
    runner.files = this.glob();
    this.grep();

    // Path the context
    context.patch(runner, options);

    // Enable coverage
    if (options.coverage) {
      this.coverage();
    }

    this.run = this.runNode;
  },

  'initBrowser': function () {
    var server = require('./server');

    var options = this.options;
    var runner = this.runner = server.runner;
    runner.ui = options.ui;
    runner.reporter = options.reporter;

    var base = runner.base = path.resolve(options.base);
    runner.files = this.glob().map(function (file) {
      return file.replace(base, '');
    });

    server.listen();

    this.run = this.runBrowser;
  },

  'configure': function () {
    var options = this.options;
    var runner = this.runner;
    runner.ui(options.ui);
    runner.reporter(options.reporter);

    // Find requirejs modules in the app folder
    options.baseUrl = path.resolve(options.base, options.require.base);
  },

  'coverage': function () {
    var options = this.options;

    // Try to enable coverage
    try {
      var covModPath = process.cwd() + '/node_modules/kaapi.coverage';
      kaapiCoverage = require(covModPath);
    } catch (e) {}

    // kaapi.coverage isn't installed
    if (!kaapiCoverage) {
      console.error('install "kaapi.coverage" for coverage reports');
      process.exit(-1);
    }

    // coverage path must be a string
    if (typeof options.coverage !== 'string') {
      options.coverage = path.resolve('coverage');
    }

    kaapiCoverage.patch(context.requirejs);
  },

  'grep': function () {
    var options = this.options;
    var runner = this.runner;

    // add support for grepping specs
    if (options.grep && runner.files.length) {
      runner.grep(options.grep);
    }
  },

  // populate files
  'glob': function (pattern) {
    var options = this.options;
    pattern = pattern || options.files.specs;
    var globRule = path.resolve(options.base, pattern);
    var files = this.files = glob.sync(globRule);
    return files;
  },

  'runNode': function (callback) {
    var self = this;
    self.purge();
    self.runner.run(function () {
      var coverage = self.options.coverage;
      if (coverage) {
        kaapiCoverage.generate(coverage);
      }

      if (typeof callback === 'function') {
        callback.apply(null, arguments);
      }
    });
  },

  'runBrowser': function (callback) {
    if (typeof callback === 'function') {
      callback.apply(null, arguments);
    }
  },

  'purge': function () {

    // Flush node's cache
    this.files.forEach(function (file) {
      delete require.cache[file];
    });

    // & require.js's cache as well
    var name, defined, module, ctx;
    var rContexts = context.requirejs.s.contexts;
    for (name in rContexts) {
      ctx = rContexts[name];
      defined = ctx.defined;
      for (module in defined) {
        ctx.require.undef(module);
      }
    }
  },

  'reset': function () {
    var runner = this.runner;
    runner.suite = runner.suite.clone();
    runner.ui(this.options.ui);
    runner.files = this.files;
  }
};

module.exports = Kaapi;
