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
    .construct(function() {
      this.files = {};
      this.annotate = null; // set by annotator
    })
    .method('validate', function(f) {
      if (!(f && f.id)) {
        throwValidationError('id', 'File must have an id');
      }
      return f;
    })
    .method('set', function(a) {
      var n = this.validate(_.defaults({}, a, {
        '@': {
          ext: {}
        },
        ext: {}
      }));
      return this.files[n.id] = this.annotate(n);
    })
    .method('get', function(id) {
      return this.files[id];
    })
    .method('getAll', function() {
      return _.values(this.files);
    })
    .method('each', function(f){
      _.each(this.files,f);
    })
    .toClass();

  module.exports = Files;
})(module);
