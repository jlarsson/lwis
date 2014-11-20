(function(module) {
  'use strict';

  var _ = require('lodash');
  var classBuilder = require('ryoc');

  function throwValidationError(field, message) {
    var error = new Error(message);
    error.field = field;
    throw error;
  }

  var Files = classBuilder()
    .construct(function(annotations) {
      this.annotations = annotations;
      this.files = {};
    })
    .method('validate', function(f) {
      if (!(f && f.id)) {
        throwValidationError('id', 'File must have an id');
      }
      return f;
    })
    .method('add', function(a) {
      var n = this.validate(_.defaults({}, a, {
        '@': {},
        ext: {}
      }));
      return this.files[n.id] = n;
    })
    .method('get', function(id) {
      return this.annotations.updateFile(this.files[id] || null);
    })
    .method('getAll', function() {
      return _(this.files).map(function(f) {
        return this.annotations.updateFile(f);
      }.bind(this)).value();
    })
    .toClass();

  module.exports = Files;
})(module);
