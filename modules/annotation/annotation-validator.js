(function(module) {
  'use strict';

  var validation = require('../validation');

  module.exports = function configureAnnotationValidator(app, options) {
    app.set('annotation-validator', validation()
      .notEmpty('name', 'Please give this annotation a name')
      .notEmpty('type', 'Ouch! No type?')
    );
  }
})(module);
