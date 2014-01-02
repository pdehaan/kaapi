module.exports = function (grunt) {

  'use strict';

  var Kaapi = require('..');
  var defaults = require('../lib/defaults');

  function NodeRunner () {

    // default options
    var options = this.options(defaults);

    // Async task here
    var done = this.async();

    // support grep
    if (this.args.length) {
      options.grep = this.args[0];
    }

    // Create a new runner
    var runner = new Kaapi(options);
    runner.glob(options.files.specs);

    // Run it
    runner.run(function (count) {

      // Stop fataly on any failed specs
      if (count) {
        grunt.fatal(count + ' failures.');
      }

      done();
    });
  }

  grunt.registerTask('kaapi/node', NodeRunner);
};