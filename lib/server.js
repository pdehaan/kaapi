var http = require('http');
var path = require('path');
var send = require('send');
var url  = require('url');

var libsMap = require('./data/libs');
var roots = {
  'runner': 'static',
  'libs': 'node_modules',
  'specs': 'specs',
  'source': 'public'
};

var libRegEx = /^\/__libs\/(.*)/;
function handler (request, response) {
  var root;
  var pathname = url.parse(request.url).pathname;

  var matches = pathname.match(libRegEx);
  if (pathname === '/config') {
    return returnConfig (response);
  } else if (matches && matches[1] in libsMap) {
    pathname = '/' + libsMap[matches[1]];
    root = path.resolve(__dirname, '..', roots.libs);
  } else if (/^\/(specs|integrations)\//.test(pathname)) {
    root = path.resolve(app.runner.base);
  } else if (/^\/(index\.(js|html))?($|\?)/.test(pathname)) {
    root = path.resolve(__dirname, '..', roots.runner);
  } else {
    root = path.resolve(app.runner.base, roots.source);
  }

  send(request, pathname).root(root).pipe(response);
}

function returnConfig (response) {
  response.writeHead(200, {'Content-Type': 'application/javascript'});
  response.end(JSON.stringify(app.runner));
}

function listen () {
  var server = http.createServer(handler);
  server.listen(9876, '127.0.0.1', function () {
    console.info('Server started');
  });
}

var app = module.exports = { 'listen': listen };
app.runner = {};

if (!module.parent) {
  listen();
}