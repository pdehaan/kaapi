(function (global, undefined) {

  'use strict';

  // var document = global.document;
  var mocha = global.mocha;
  var requirejs = global.requirejs;

  function ajax (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback(xhr.responseText);
        }
      }
    };
    xhr.send();
  }

  ajax('/config', function (config) {
    config = JSON.parse(config);

    mocha.setup({
      'ui': config.ui,
      'reporter': 'html'
    });

    if (config.grep) {
      mocha.grep(config.grep);
    }

    global.isNode = false;
    global.expect = global.expect || global.chai.expect;

    var require = requirejs.config(config.requirejs);
    require(config.files, function () {
      if (global.mochaPhantomJS) {
        global.mochaPhantomJS.run();
      } else {
        mocha.run();
      }
    });
  });

})(this);