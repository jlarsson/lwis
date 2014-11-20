(function(module) {
  'use strict';

  var _ = require('lodash');
  var uuid = require('uuid');
  var routeHelper = require('../shared/route-helper')(__dirname);

  module.exports = function(app, options) {
    var base = '/lwis/publication';

    function mkrel(l) {
      return base + '/' + l;
    }

    var publicationValidator = app.get('publication-validator');

    routeHelper.useRoute(app, base)
      .get('/', routeHelper.html('./views/index.marko', getIndexModel))
      .get('/new', routeHelper.html('./views/edit.marko', getNewModel))
      .get('/edit/:id', routeHelper.html('./views/edit.marko', getEditModel))
      .post('/edit/:id', onEdited);

    function getIndexModel(req, cb) {
      app.get('repo').query(function(model, cb) {
          return cb(null, model.getPublications());
        },
        function(err, publications) {
          cb(null, {
            title: 'Publications',
            publications: _.values(publications),
            mkrel: mkrel
          });
        });
    }

    function getNewModel(req, cb) {
      cb(null, {
        title: 'Publications',
        publication: {},
        errors: {},
        postLink: mkrel('edit/' + uuid.v4()),
        mkrel: mkrel
      });
    }

    function getEditModel(req, res, next, cb) {
      app.get('repo').query(function(model, cb) {
          return cb(null, model.getPublication(req.params.id));
        },
        function(err, publication) {
          if (!publication) {
            return next();
          }
          cb(null, {
            title: publication.name,
            publication: publication,
            errors: publicationValidator.validate(publication) || {},
            mkrel: mkrel
          });
        });
    }

    function onEdited(req, res, next) {
      var publication = {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        route: req.body.route,
        script: req.body.script
      };
      var errors = publicationValidator.validate(publication);
      if (errors) {
        return res.json(errors);
      }

      app.get('repo').execute('set-publication', publication,
        function(err, publication) {
          if (!publication) {
            return next(err);
          }
          return res.json({});
        });
    }
  }
})(module);
