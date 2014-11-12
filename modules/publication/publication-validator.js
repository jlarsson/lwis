(function(module) {
  'use strict';

  var validation = require('../validation');
  var scriptparser = require('./script-parser');
  var routeparser = require('./route-parser');

  module.exports = function configurePublicationValidator(app, options) {
    app.set('publication-validator', validation()
      .notEmpty('name', 'Please name this publication')
      .notEmpty('description', 'Please describe this publication')
      .notEmpty('route', 'Please give this publication a link')
      .notEmpty('script', 'Add bacon!')
      .use('route', function(f, value) {
        var p = routeparser(value);
        return p.valid ? null : p.errorMessage;
      })
      .use('script', function(f, value) {
        var p = scriptparser(value, []);
        if (p.error) {
          return p.error;
        }
        if (!p.hasFilter) {
          return 'The script must atleast have a filter() function';
        }
        return null;
      })
    );
  }
})(module);
