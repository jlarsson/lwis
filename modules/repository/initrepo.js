(function(module) {
  'use strict';

  var highlander = require('highlander');
  var ryoc = require('ryoc');
  var path = require('path');
  var _ = require('lodash');
  var debug = require('debug')('lwis:repository');
  var Model = require('./model/model')

  module.exports = function(app, options) {
    var folder = path.resolve(app.get('appdata'), '.repo/.journal');
    debug('using repository in %s', folder);


    function createModel() {
      var model = Model();

      model.setPublication({
        id: '58a13e35-580b-4978-9efc-02dbcc2cf46f',
        name: 'lwis default Thumbnails',
        description: 'Thumbnails for the administrative pages',
        route: '/admin/tn/:id',
        script: 'function filter() {\n  return (this.data.id === id);\n}\nfunction transform(response){\n if (response.accepts(\'image/*\') && this.is(\'image/*\')) return response.image(\'jpg\').resize(165,165).noProfile();\n}'
      });
      model.setPublication({
        id: '6d781f94-a454-4f64-b17d-9200c0116167',
        name: 'lwis default Downloads',
        description: 'Downloads for the administrative pages',
        route: '/admin/dl/:id',
        script: 'function filter() {\n  return this.data.id === id;\n}\nfunction transform(response)\n{\n // Do nothing and pass on to default handling\n}'
      });

      model.setAnnotation({
        id: '9D0C43C2-EFA7-4E7E-A0F2-F78D5DC2C129',
        name: 'approved',
        description: 'Sample flag annotation',
        type: 'bool',
        value: false
      });

      return model;
    }

    var repository = highlander.repository({
      model: createModel(),
      journal: highlander.fileJournal({
        path: folder
      })
    });

    repository.registerCommand('set-file', function(ctx, cb) {
      return cb(null, ctx.model.setFile(ctx.args));
    });

    repository.registerCommand('set-publication', function(ctx, cb) {
      return cb(null, ctx.model.setPublication(ctx.args));
    });

    repository.registerCommand('set-annotation', function(ctx, cb) {
      return cb(null, ctx.model.setAnnotation(ctx.args));
    });

    app.set('repo', repository);
  };

})(module);
