'use strict';

var requirejs = require('requirejs');

var chai = require('chai');
var sinon = require('sinon');
var path = require('path');

// enhance chai's flavour
var sinon_chai = require('sinon-chai');
chai.use(sinon_chai);

var isTravis = (process.env.TRAVIS === 'true');

// Attach globals to all the contexts
function fixContext (ctx) {

  // make "requirejs" a global in specs running in nodejs
  ctx.requirejs = ctx.require = requirejs;
  ctx.nodeRequire = require;

  ctx.isNode = true;

  // TODO: add support for spec runner plugins
  try {
    var modPath = process.cwd() + '/node_modules/';
    var xhr = require(modPath + 'xmlhttprequest');
    ctx.XMLHttpRequest = xhr.XMLHttpRequest;
    ctx.WebSocket = require(modPath + 'ws');
  } catch(e) {}

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

  var paths = {};

  [
    'mocks',
    'require'
  ].forEach(function (name) {
    var cfg = options[name] || {};
    var base = cfg.base;
    var cPaths = cfg.paths;
    if (base && cPaths) {
      var keys = Object.keys(cPaths);
      keys.forEach(function (name) {
        paths[name] = path.resolve(options.base, base, cPaths[name]);
      });
    }
  });

  requirejs.config({
    'baseUrl': options.baseUrl,
    'paths': paths
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