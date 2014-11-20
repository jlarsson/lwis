(function(module) {
  'use strict';

  var highlander = require('highlander');
  var classBuilder = require('ryoc');
  var path = require('path');
  var _ = require('lodash');
  var debug = require('debug')('lwis:repository');

  function throwValidationError(field, message) {
    var error = new Error(message);
    error.field = field;
    throw error;
  }

  function ensureFileRuntimeProps(file) {
    var r = file['@'] || (file['@'] = {});
    return r.ext || (r.ext = {});
  }

  function createExtendNoop() {
    return {
      update: function(file) {
        return this.next ? this.next.update(file) : this;
      }
    };
  }

  function createExtendCopyFromTo(from, to) {
    return {
      update: function(file) {
        file.ext[to] = file.ext[from];
        return this.next ? this.next.update(file) : this;
      }
    };
  }

  function createExtendDefaultValue(annotation) {
    return {
      update: function(file) {
        var props = ensureFileRuntimeProps(file);
        if (props.ign) {
          if (props.ign.keys[annotation.id]) {
            return this.next ? this.next.update(file) : this;
          }
        }
        file.ext[annotation.name] = annotation.value;
        return this.next ? this.next.update(file) : this;
      }
    };
  }

  var Annotations = classBuilder()
    .construct(function() {
      this.headExtender = {
        update: function(file) {
          return this.next ? this.next.update(file) : this;
        }
      };
      this.tailExtender = this.headExtender;
      this.defaultIgnoreSet = {
        key: '',
        keys: {}
      };
      this.ignoreSets = {
        '': this.defaultIgnoreSet
      };
      this.annotations = {};
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
    .method('updateFile', function(f) {
      if (f) {
        var props = ensureFileRuntimeProps(f);
        var extend = props.extend || this.headExtender;
        if (extend.next) {
          props.extend = extend.update(f);
        }
      }
      return f;
    })
    .method('add', function(a) {
      var n = this.validate(_.defaults({}, a, {
        name: '',
        type: 'string',
        value: '',
        description: ''
      }));

      var existing = this.annotations[n.id];
      var isNameChange = existing && (existing.name != n.name);
      var isTypeChange = existing && (existing.type != n.type);
      if (isNameChange && !isTypeChange) {
        this.tailExtender = (this.tailExtender.next = createExtendCopyFromTo(existing.name, n.name));
      } else {
        this.tailExtender = (this.tailExtender.next = createExtendDefaultValue(n));
      }
      this.annotations[n.id] = n;

      return n;
    })
    .method('get', function(id) {
      return this.annotations[id];
    })
    .method('annotateFile', function(id, file, value) {
      if (file) {
        var annotation = this.annotations[id];
        if (annotation) {
          // bring file up to date
          file = this.updateFile(file);
          // get current ignore set
          var props = ensureFileRuntimeProps(file);
          var ignoreSet = props.ign || this.defaultIgnoreSet;

          // do we need to expand ignore set?
          if (ignoreSet.keys[annotation.id] === undefined) {
            // calculate keys for new ignore set
            var newKeys = _.values(ignoreSet.keys).concat([annotation.id]);
            newKeys.sort();
            var newKey = newKeys.join('\n');
            var newIgnoreSet = this.ignoreSets[newKey];
            if (!newIgnoreSet) {
              newIgnoreSet = {
                key: newKey,
                keys: _.reduce(newKeys, function(agg, k) {
                  agg[k] = true;
                  return agg;
                }, {})
              };
              this.ignoreSets[newKey] = newIgnoreSet;
            }
            ignoreSet = newIgnoreSet;
            props.ign = ignoreSet;
          }
          file.ext[annotation.name] = value;
        }
      }
      return file;
    })
    .toClass();

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
    .toClass();

  var Model = classBuilder()
    .construct(function() {
      this.annotations = Annotations();
      this.files = Files(this.annotations);
      this.publications = {};
    })
    .method('__applyAnnotations', function(file) {
      var a = _(this.annotations).reduce(function(agg, a) {
        agg[a.name] = a.value;
        return agg;
      }, {});
      file.a = a;
      return file;
    })
    .method('addFile', function(file) {
      return this.files.add(file);
    })
    .method('getFile', function(id) {
      return this.files.get(id);
    })
    .method('getFiles', function() {
      return this.files.getAll();
    })
    .method('annotateFile', function(fileId, annotationId, value) {
      return this.annotations.annotateFile(annotationId, this.files.get(fileId), value)
    })
    .method('addAnnotation', function(annotation) {
      return this.annotations.add(annotation);
    })
    .method('updatePublication', function(publication) {
      this.publications[publication.id] = publication;
      return publication;
    })
    .method('getPublication', function(id) {
      return this.publications[id];
    })
    .method('getPublications', function() {
      return _.values(this.publications);
    })
    .method('getAnnotation', function(id) {
      return this.annotations[id];
    })
    .method('getAnnotations', function() {
      return _.values(this.annotations);
    })
    .toClass();

  module.exports = Model;

})(module);
