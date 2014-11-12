(function(module) {
  'use strict';

  var debug = require('debug')('lwis:publication-middleware')
  var scriptparser = require('./script-parser');
  var routeparser = require('./route-parser');
  var transformResponse = require('./transform/response');
  var transformItem = require('./transform/transform-item');
  var path = require('path');
  var fs = require('fs');
  var async = require('async');
  var uuid = require('uuid');
  var _ = require('lodash');

  module.exports = function configurePublicationMiddlewareFactory(app, options) {

    app.set('publication-middleware-factory', factory);


    var cache = {};

    // Trigger changes in the repo
    // Out action is to toss away all existing dynamic routes
    // TODO: Improvements?
    app.get('repo').on('executed', function onRepositoryChanged(data) {
      if (data.command.indexOf('publication') >= 0) {
        debug('clearing fast cache');
        cache = {};
      }
    });

    function factory(publication) {
      debug('constructing publication middleware for %s', publication);

      var parsedRoute = routeparser(publication.route);
      if (!parsedRoute.valid) {
        return null;
      }

      var parsedScript = scriptparser(publication.script, parsedRoute.params);
      if (!parsedScript.valid) {
        return null;
      }

      return createMiddleware(publication, parsedRoute, parsedScript);
    };

    function createMiddleware(publication, parsedRoute, parsedScript) {
      return function middleware(req, res, next) {
        // TODO: Clear out this cache whenever anything is changed in the repository

        // Check if there is a blob in the cache
        var cachedInfo = cache[req.originalUrl];
        if (cachedInfo) {
          if (req.accepts(cachedInfo.mimetype)) {
            debug('found cached blob, bypassing logic');
            res.contentType(cachedInfo.mimetype);
            return cachedInfo.blob.send(req, res);
          }
          return next();
        }

        var script;
        app.get('repo').query(function(model, cb) {
            debug('trying to handle publication with %s', publication);
            return cb(null, model.getFiles());
          },
          function(err, files) {
            if (err) {
              return next();
            }
            if (files.length === 0) {
              return next();
            }
            files = _.map(files, transformItem);

            script = parsedScript.createScript(req.params);
            // Filter the files
            var files = script.filter(files);
            if (files.length === 0) {
              return next();
            }

            var file = files[files.length - 1];

            // Apply transformations
            var transform = script.transform(file, [transformResponse(req)]);

            // TODO: Check that if transform then is AbstractTransform

            return download(cache, file.data, transform, req, res, next);
          });
      };
    }


    function download(cache, file, transform, req, res, next) {
      var actions;
      var transformedBlobKey;

      if (transform) {
        transformedBlobKey = file.blob.hash + '/' + transform.__internal_get_signature();
        actions = [tryLoadSourceBlob,
          trySendDerivedBlob,
          tryDeriveSourceBlob,
          trySaveDerivedBlob,
          trySendDerivedBlob
        ]
      } else {
        transformedBlobKey = file.blob.key;
        actions = [trySendDerivedBlob];
      }

      var blobstore = app.get('blobstore');
      var repo = app.get('repo');

      var isDone = false;
      var sourceBlob;
      var derivedTempPath = path.resolve(app.get('temp'), uuid.v4());
      var derivedBlob;

      async.series(actions, function(err) {
        if (derivedTempPath) {
          fs.unlink(derivedTempPath, function() {});
        }
        if (!isDone) {
          isDone = true;
          next(err);
        }
      });

      function trySendDerivedBlob(cb) {
        if (isDone) {
          return cb();
        }
        blobstore.getBlob(transformedBlobKey, function(err, blob) {
          if (err) {
            debug('failed to find existing derived blob: %j', err);
            return cb(); // pass on to next handler
          }
          isDone = true;
          cache[req.originalUrl] = {
            mimetype: file.mimetype,
            blob: blob
          };
          var ct = blob.headers.mimetype || file.mimetype;
          if (file.charset) {
            ct = ct + '; charset=' + file.charset;
          }
          res.contentType(ct);
          blob.send(req, res);
          cb();
        });
      }

      function tryLoadSourceBlob(cb) {
        if (isDone) {
          return cb();
        }
        blobstore.getBlob(file.blob.key, function(err, blob) {
          if (err) {
            debug('failed to find source blob: %j', err);
            return cb(err);
          }
          sourceBlob = blob;
          cb();
        });
      }

      function tryDeriveSourceBlob(cb) {
        if (isDone) {
          return cb();
        }

        derivedBlob = createBlob(derivedTempPath, {
          key: transformedBlobKey
        });
        transform.__internal_apply_transform({
          sourceFile: file,
          sourceBlob: sourceBlob,
          destBlob: derivedBlob
        }, function(err) {
          if (err) {
            debug('failed to transform blob: %j', err);
          }
          cb(err);
        });
      }

      function trySaveDerivedBlob(cb) {
        if (isDone) {
          return cb();
        }
        blobstore.addBlob(derivedBlob, function(err) {
          if (err) {
            debug('failed to store derived blob: %j', err);
          }
          cb(err);
        });
      }
    }
  }
})(module);
