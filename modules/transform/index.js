(function (module) {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var parser = require('./transform-parser');
    var debug = require('debug')('lwis:transform');
    var _ = require('lodash');
    var async = require('async');
    var gm = require('gm');
    var uuid = require('uuid');
    var createBlob = require('blobstore').createBlob;

    module.exports = function (app, options) {
        app.set('transform', {
            createHandler: function (transform) {

                debug('constructing route handler for %s', transform);
                var parsed = parser.parse(transform);

                var cache = {};

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

                    app.get('repo').query(function (model, cb) {
                            debug('trying to handle route with %s', transform);
                            var context = {
                                req: req
                            };
                            return cb(null, _(model.files).filter(function (file) {
                                debug('testing %j', file);
                                context.current = file;
                                return parsed.filter.evaluate(context);
                            }).value());
                        },
                        function (err, files) {
                            if (err) {
                                return next();
                            }
                            if (files.length === 0) {
                                return next();
                            }
                            var file = files[files.length-1];

                            if (!req.accepts(file.mimetype)) {
                                return next();
                            }

                            return download(cache, file, parsed.transform, req, res, next);
                            next();
                        });

                }
            }
        });

        function download(cache, file, transforms, req, res, next) {
            // Transformation signature
            var transformSignature = _(transforms).map(function (t) {
                return t.describe();
            }).value().join('&');
            // Key of transformed blob
            var tranformedBlobKey = file.blob.hash + (transforms.length === 0 ? '' : '/' + transformSignature);

            var blobstore = app.get('blobstore');
            var repo = app.get('repo');

            var isDone = false;
            var sourceBlob;
            var derivedTempPath = path.resolve(app.get('temp'), uuid.v4());

            var actions = transforms.length === 0 ? [trySendDerivedBlob] : [tryLoadSourceBlob,
                trySendDerivedBlob,
                tryDeriveSourceBlob,
                trySaveDerivedBlob,
                trySendDerivedBlob];
            async.series(actions, function (err) {
                if (derivedTempPath) {
                    fs.unlink(derivedTempPath, function () {});
                }
                if (!isDone) {
                    next();
                }
            });

            function trySendDerivedBlob(cb) {
                if (isDone) {
                    return cb();
                }
                blobstore.getBlob(tranformedBlobKey, function (err, blob) {
                    if (err) {
                        debug('failed to find existing derived blob: %j', err);
                        return cb(null); // pass on to next handler
                    }
                    res.contentType(file.mimetype);
                    blob.send(req, res);
                    cache[req.originalUrl] = {
                        mimetype: file.mimetype,
                        blob: blob
                    };
                    isDone = true;
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
                var context = {
                    current: file,
                    gm: gm(sourceBlob.path)
                };
                _(transforms).each(function (transform) {
                    transform.transform(context);
                });

                //context.gm = context.gm.resize(128,128);
                context.gm.write(derivedTempPath, function (err) {
                    if (err) {
                        debug('failed to derive blob with GraphicsMagick: %j', err);
                    }
                    cb(err);
                });
            }

            function trySaveDerivedBlob(cb) {
                if (isDone) {
                    return cb();
                }
                var derivedBlob = createBlob(derivedTempPath, {
                    key: tranformedBlobKey
                });
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