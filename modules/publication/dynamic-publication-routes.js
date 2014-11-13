(function(module) {
  'use strict';

  var express = require('express');
  var Router = express.Router;
  var debug = require('debug')('lwis:publication');
  var _ = require('lodash');

  module.exports = function(app, options) {

    var router = Router();
    app.use('/', router);

    // Trigger changes in the repo
    // Our action is to toss away all existing dynamic routes
    // TODO: Improvements?
    app.get('repo').on('executed', function onRepositoryChanged(data) {
      if (data.command.indexOf('publication') >= 0) {
        debug('rebuilding publications');
        applyDynamicPublications();
      }
    });

    var dynamicRevision = {
      valid: true
    };
    applyDynamicPublications();


    function applyDynamicPublications() {
      var revision = {
        valid: false // not valid until all publications are routed below
      };

      app.get('repo').query(function(model, cb) {
          return cb(null, model.getPublications());
        },
        function(err, publications) {
          _(publications).each(function(publication) {
            debug('applying publication %j', publication);

            var handler = app.get('publication-middleware-factory')(publication);

            if (handler) {
              router.get(publication.route, function(req, res, next) {
                if (!revision.valid) {
                  return next();
                }
                handler(req, res, next);
              });
            }
          });
          // Invalidate all existing publications
          dynamicRevision.valid = false;
          dynamicRevision = revision;
          revision.valid = true;

        });
    };
  }
})(module);
