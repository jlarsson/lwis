(function(module) {
  'use strict';

  var validation = require('../validation');
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
        var p = app.get('filter-transform-parser')(value, []);
        if (p.error) {
          return p.error;
        }
        return null;
      })
    );
  }
})(module);
