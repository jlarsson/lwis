(function (module) {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var scriptparser = require('./script-parser');
    var routeparser = require('./route-parser');
    var debug = require('debug')('lwis:publication');
    var _ = require('lodash');
    var async = require('async');
    var gm = require('gm');
    var uuid = require('uuid');
    var createBlob = require('blobstore').createBlob;
    var validation = require('../validation');
    var transformFactory = require('./transform/transform-factory');
    //var extendFiles = require('./transform/extend-files');
    var fileHolder = require('./transform/file-holder');
    
    module.exports = function (app, options) {

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

        app.set('publication-validator', validation()
            .notEmpty('name', 'Please name this publication')
            .notEmpty('description', 'Please describe this publication')
            .notEmpty('route', 'Please give this publication a link')
            .notEmpty('script', 'Add bacon!')
            .use('route', function (f, value) {
                var p = routeparser(value);
                return p.valid ? null : p.errorMessage;
            })
            .use('script', function (f, value) {
                var p = scriptparser(value, []);
                if (p.error) {
                    return p.error;
                }
                if (!p.hasFilter) {
                    return 'The script must atleast have a filter() function';
                }
                return null;
            }));

        app.set('publication', {
            createHandler: function (publication) {

                debug('constructing publication handler for %s', publication);

                var parsedRoute = routeparser(publication.route);
                if (!parsedRoute.valid) {
                    return null;
                }

                var parsedScript = scriptparser(publication.script, parsedRoute.params);
                if (!parsedScript.valid) {
                    return null;
                }

                return function (req, res, next) {
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

                    app.get('repo').query(function (model, cb) {
                            debug('trying to handle publication with %s', publication);
                            return cb(null, model.getFiles());
                        },
                        function (err, files) {
                            if (err) {
                                return next();
                            }
                            if (files.length === 0) {
                                return next();
                            }

                            //files = extendFiles(files);
                            files = _.map(files, fileHolder);

                            script = parsedScript.createScript(req.params);
                            // Filter the files
                            var files = script.filter(files);
                            if (files.length === 0) {
                                return next();
                            }

                            var file = files[files.length - 1];

                            /*
                            if (!req.accepts(file.mimetype)) {
                                return next();
                            }
                            */

                            // Apply transformations
                            var transform = script.transform(file, [transformFactory(req)]);

                            // TODO: Check that if transform then is AbstractTransform

                            return download(cache, file.data, transform, req, res, next);
                        });
                }
            }
        });

        function download(cache, file, transform, req, res, next) {
            var actions;
            var transformedBlobKey;

            if (transform) {
                transformedBlobKey = file.blob.hash + '/' + transform.__internal_get_signature();
                actions = [tryLoadSourceBlob,
                trySendDerivedBlob,
                tryDeriveSourceBlob,
                trySaveDerivedBlob,
                trySendDerivedBlob]
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

            async.series(actions, function (err) {
                if (derivedTempPath) {
                    fs.unlink(derivedTempPath, function () {});
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
                blobstore.getBlob(transformedBlobKey, function (err, blob) {
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
                blobstore.getBlob(file.blob.key, function (err, blob) {
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
                }, function (err) {
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
                blobstore.addBlob(derivedBlob, function (err) {
                    if (err) {
                        debug('failed to store derived blob: %j', err);
                    }
                    cb(err);
                });
            }
        }
    };
})(module);