'use strict';

var webpage = require('webpage');
var system  = require('system');

var page = webpage.create();
page.open('http://127.0.0.1:9876/');
page.onCallback = function (data) {
  if (data.hasOwnProperty('report')) {
    system.stdout.write(data.report);
  }
};
system.stdout.write('started');