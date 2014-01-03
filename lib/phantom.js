var childProcess = require('child_process');
var phantom = require('phantomjs');
var path = require('path');

function start (port, next) {
  // ['--webdriver', port, ]
  var phantomOpts = [path.resolve(__dirname, '../static/phantom.js')];
  var phantomProc = childProcess.execFile(phantom.path, phantomOpts);
  phantomProc.stdout.setEncoding('utf8');
  var onPhantomData = function (data) {
    if (data.match(/running/i)) {
      console.log('PhantomJS started.');
      // phantomProc.stdout.removeListener('data', onPhantomData);
      next(null, phantomProc);
    }
    else if (data.match(/error/i)) {
      console.error('Error starting PhantomJS');
      next(new Error(data));
    } else {
      console.log(data);
    }
  };
  phantomProc.stdout.on('data', onPhantomData);
  phantomProc.stdout.pipe(process.stdout);
}

module.exports = {
  'start': start
};