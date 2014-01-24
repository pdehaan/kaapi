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
    global.should = global.chai.should();
    global.expect = global.chai.expect;

    requirejs(config.files, function () {
      mocha.run();
    });
  });

})(this);