(function(module) {
  'use strict';

  var classBuilder = require('ryoc');
  var _ = require('lodash');

  function throwValidationError(field, message) {
    var error = new Error(message);
    error.field = field;
    throw error;
  }

  var Annotations = classBuilder()
    .construct(function(files) {
      this.files = files;
      this.annotations = {};
      files.annotate = function(file) {
        _(this.annotations).reduce(function(ext, a) {
          ext[a.name] = a.value;
          return ext;
        }, file.ext);
        return file;
      }.bind(this);
    })
    .method('validate', function(a) {
      if (!a.id) {
        throwValidationError('id', 'Annotation must have an id');
      }
      if (!a.name) {
        throwValidationError('name', 'Annotation must have a name');
      }
      return a;
    })
    .method('set', function(a) {
      var n = this.validate(_.defaults({}, a, {
        name: '',
        type: 'string',
        value: '',
        description: ''
      }));

      var existing = this.annotations[n.id];

      var typeOfChange = '';
      typeOfChange += existing && (existing.name != n.name) ? 'n' : '';
      typeOfChange += existing && (existing.type != n.type) ? 't' : '';
      typeOfChange += existing && (existing.value != n.value) ? 'v' : '';

      var f;
      switch (typeOfChange) {
        case '':
          f = function(file) {
            file.ext[n.name] = n.value;
          };
          break;
        case 'ntv':
          f = function changeNameTypeValue(file) {
            var x = file['@'].ext;
            var y = file.ext;
            if (x[existing.name]) {
              delete x[existing.name];
              delete y[existing.name];
              x[name.name] = true;
            }
            delete y[existing.name];
            y[n.name] = n.value;
          }
          break;
        case 'nv':
          f = function changeName(file) {
            var x = file['@'].ext;
            var y = file.ext;
            if (x[existing.name]) {
              delete x[existing.name];
              x[name.name] = true;
              y[n.name] = y[existing.value];
            } else {
              y[n.name] = n.value;
            }
            delete y[existing.name];
          }
          break;
        case 'nt':
          f = function changeName(file) {
            var x = file['@'].ext;
            var y = file.ext;
            if (x[existing.name]) {
              delete x[existing.name];
              x[name.name] = true;
            }
            y[n.name] = n.value;
            delete y[existing.name];
          }
          break;
        case 'tv':
        case 't':
          f = function resetToDefault(file) {
            delete file['@'].ext[n.name];
            f.ext[n.name] = n.value;
          }
          break;
        case 'n':
          f = function changeName(file) {
            var x = file['@'].ext;
            var y = file.ext;
            if (x[existing.name]) {
              delete x[existing.name];
              x[name.name] = true;
            }
            y[n.name] = y[existing.name];
            delete y[existing.name];
          }
          break;
        case 'v':
          f = function applyDefaultValueChange(file) {
            if (!file['@'].ext[n.name]) {
              file.ext[n.name] = n.value;
            }
          }
          break;
      }
      this.files.each(f);
      return this.annotations[n.id] = n;
    })
    .method('get', function(id) {
      return this.annotations[id];
    })
    .method('getAll', function() {
      return _.values(this.annotations);
    })
    .method('annotateFile', function(id, file, value) {
      if (file) {
        var annotation = this.annotations[id];
        if (annotation) {
          file['@'].ext[annotation.name] = true;
          file.ext[annotation.name] = value;
        }
      }
      return file;
    })
    .toClass();

  module.exports = Annotations;

})(module);
