'use strict';

var extend = require('node.extend');
var glob = require('mocha/node_modules/glob');
var Mocha = require('mocha');
var path = require('path');

var context = require('./context');
var defaults = require('./defaults');

function fixOptions (options) {
  return extend({}, defaults, options);
}

function Kaapi (options) {

  options = this.options = fixOptions(options);

  // Create a new spec-runner
  var runner = this.runner = new Mocha();

  // load files
  this.glob();

  // Configure Mocha UI & Reporter
  runner.ui(options.ui);
  runner.reporter(options.reporter);

  // find modules in the app folder
  options.baseUrl = path.resolve(options.base, options.require.base);

  // Path the context
  context.patch(runner, options);
}

Kaapi.prototype = {

  // populate files
  'glob': function (pattern) {
    var options = this.options;
    var runner = this.runner;

    pattern = pattern || options.files.specs;
    var globRule = path.resolve(options.base, pattern);
    this.files = runner.files = glob.sync(globRule);

    // add support for grepping specs
    if (options.grep && runner.files.length) {
      runner.grep(options.grep);
    }
  },

  'run': function (callback) {
    this.purge();
    this.runner.run(callback);
  },

  'purge': function () {
    this.files.forEach(function (file) {
      delete require.cache[file];
    });

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
