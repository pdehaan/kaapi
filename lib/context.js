'use strict';

var requirejs = require('requirejs');

var chai = require('chai');
var sinon = require('sinon');

// enhance chai's flavour
chai.use(require('sinon-chai'));

var isTravis = (process.env.TRAVIS === 'true');

// Attach globals to all the contexts
function fixContext (ctx) {

  // make "requirejs" a global in specs running in nodejs
  ctx.requirejs = ctx.require = requirejs;
  ctx.nodeRequire = require;

  // make requirejs methods available
  ctx.define = requirejs.define;

  // make chai functions available
  ctx.should = chai.should();
  ctx.expect = chai.expect;

  // make sinon available
  ctx.sinon = sinon;

  // Environment variables
  ctx.env = {
    'node': true,
    'travis': isTravis
  };
}

// Patch each context, for each suite
function onSuite (suite) {
  suite.on('beforeEach', function (hook) {
    fixContext(hook.ctx);
  });
}

function patchContext (runner, options) {

  requirejs.config({
    'baseUrl': options.baseUrl
  });

  runner.suite.on('pre-require', function (context) {

    // fix the main suite context first
    fixContext(context);

    // also make all this stuff available
    // on beforeEach of these suites
    runner.suite.on('suite', onSuite);
  });
}

module.exports = {
  'fix': fixContext,
  'patch': patchContext,
  'requirejs': requirejs
};