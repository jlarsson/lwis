(function(module) {
  'use strict';

  var classBuilder = require('ryoc');
  var _ = require('lodash');

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
    .method('getAll', function() {
      return _.values(this.annotations);
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

  module.exports = Annotations;

})(module);
