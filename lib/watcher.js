var path = require('path');
var watcher = require('watch');
var minimatch = require('minimatch');

function Watcher (kaapi) {
  this.kaapi = kaapi;
  this.base = path.resolve(kaapi.options.base);
}

var jsRegExp = /\.js$/i;
var ignoreDirs = /\b(node_modules|.git)\b/;

function filter (directory, pattern) {
  return function (name, stat) {
    name = name.replace(directory, '');
    var valid = stat.isDirectory() ||
               (jsRegExp.test(name) &&
               !ignoreDirs.test(name) ||
                minimatch(name, pattern));
    return !valid;
  };
}

function watch (directory, pattern) {
  var self = this;
  directory = path.join(this.base, directory);
  watcher.createMonitor(directory, {
    'interval': 500,
    'filter': filter (directory, pattern)
  }, function (monitor) {
    var handler = self.handle.bind(self);
    monitor.on('created', handler);
    monitor.on('changed', handler);
  });
}

function handle () {
  var kaapi = this.kaapi;
  kaapi.reset();
  kaapi.run();
}

Watcher.prototype = {
  'watch': watch,
  'handle': handle
};

module.exports = Watcher;
