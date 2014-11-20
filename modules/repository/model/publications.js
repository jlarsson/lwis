(function(module) {
  'use strict';

  var _ = require('lodash');
  var classBuilder = require('ryoc');

  function throwValidationError(field, message) {
    var error = new Error(message);
    error.field = field;
    throw error;
  }

  var Publications = classBuilder()
    .construct(function() {
      this.publications = {};
    })
    .method('validate', function(p) {
      if (!(p && p.id)) {
        throwValidationError('id', 'Publications must have an id');
      }
      return p;
    })
    .method('set', function(publication) {
      var n = this.validate(_.defaults({}, publication, {
        '@': {},
        ext: {}
      }));
      return this.publications[n.id] = n;
    })
    .method('get', function(id) {
      return this.publications[id];
    })
    .method('getAll', function() {
      return _.values(this.publications);
    })
    .toClass();

  module.exports = Publications;
})(module);
