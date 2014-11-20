(function(module) {
  'use strict';

  var highlander = require('highlander');
  var ryoc = require('ryoc');
  var path = require('path');
  var _ = require('lodash');
  var debug = require('debug')('lwis:repository');

  var Model = ryoc()
    .construct(function() {
      this.files = {};
      this.publications = {
        '58a13e35-580b-4978-9efc-02dbcc2cf46f': {
          id: '58a13e35-580b-4978-9efc-02dbcc2cf46f',
          name: 'lwis default Thumbnails',
          description: 'Thumbnails for the administrative pages',
          route: '/admin/tn/:id',
          script: 'function filter() {\n  return (this.data.id === id);\n}\nfunction transform(response){\n if (response.accepts(\'image/*\') && this.is(\'image/*\')) return response.image(\'jpg\').resize(165,165).noProfile();\n}'
        },
        '6d781f94-a454-4f64-b17d-9200c0116167': {
          id: '6d781f94-a454-4f64-b17d-9200c0116167',
          name: 'lwis default Downloads',
          description: 'Downloads for the administrative pages',
          route: '/admin/dl/:id',
          script: 'function filter() {\n  return this.data.id === id;\n}\nfunction transform(response)\n{\n // Do nothing and pass on to default handling\n}'
        }
      };
      this.annotations = {};
      this.updateAnnotation({
        id: '9D0C43C2-EFA7-4E7E-A0F2-F78D5DC2C129',
        name: 'approved',
        description: 'Sample flag annotation',
        type: 'bool',
        value: false
      }, _.noop);
    })
    .method('getFile', function(id) {
      return this.files[id] || null;
    })
    .method('getFiles', function() {
      return _.values(this.files);
    })
    .method('addFile', function(file) {
      file.opts = this._defaultAnnotationForFile;
      return this.files[file.id] = file;
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
    .method('updateAnnotation', function(annotation, cb) {
      // Is there a name conflict?
      var hasNameConflict = _(this.annotations).some(function(other) {
        return (other.name == annotation.name) & (other.id != annotation.id);
      });
      if (hasNameConflict) {
        return cb('There is already an annotation with that name.');
      }
      this.annotations[annotation.id] = annotation;

      this._defaultAnnotationForFile = _.reduce(this.annotations, function(agg, a) {
        agg[a.name] = a.value === undefined ? null : a.value;
        return agg;
      }, {});

      _.each(this.files, function (f){
        f.opts[annotation.name] = annotation.value;
      });

      return cb(null, annotation);
    })
    .toClass();

  module.exports = function(app, options) {
    var folder = path.resolve(app.get('appdata'), '.repo/.journal');
    debug('using repository in %s', folder);

    var repository = highlander.repository({
      model: new Model(),
      journal: highlander.fileJournal({
        path: folder
      })
    });

    repository.registerCommand('add-file', function(ctx, cb) {
      return cb(null, ctx.model.addFile(ctx.args));
    });

    repository.registerCommand('update-publication', function(ctx, cb) {
      return cb(null, ctx.model.updatePublication(ctx.args));
    });

    repository.registerCommand('update-annotation', function(ctx, cb) {
      return ctx.model.updateAnnotation(ctx.args, cb);
    });

    app.set('repo', repository);
  };

})(module);
