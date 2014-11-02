(function (module) {
    'use strict';
    
    var express = require('express');
    var Router = express.Router;
    var debug = require('debug')('lwis:repository');
    
    module.exports = function (app, options) {
        var router = Router();
        router.get('/', function (req, res) {
            return res.redirect('./index');

        });
        router.get('/index', function (req, res) {

            req.app.get('repo').query(function (model, cb) {
                    cb(null, model.getAllFiles());
                },
                function (err, files) {
                    res.render('repo/index', {
                        title: 'Repository',
                        files: files
                    });
                });
        });

        router.get('/thumbnail/:id', function (req, res, next) {
            app.get('asset-transformer')
                .sendTransform('admin-download', req,res, next);
        });
        
        router.get('/download/:id', function (req, res, next) {
            var id = req.params.id;
            debug('download:%s', id);
            function onGetBlob(err, blob) {
                debug('onGetBlob');
                if (err) {
                    return next();
                }
                //blob.createReadStream().pipe(res);
                blob.send(req,res);
            }

            function onGetFile(err, file) {
                debug('onGetFile');
                if (err) {
                    debug('onGetFile error: %j', err);
                    return next();
                }
                if (!file){
                    debug('onGetFile - no file');
                    return next();
                }
                if (!req.accepts(file.mimetype)) {
                    return next();
                }
                res.contentType(file.mimetype);
                req.app.get('blobstore').getBlob(file.blob.key, onGetBlob);
            }

            req.app.get('repo').query(function (model, cb) {
                    return cb(null, model.getFileById(req.params.id));
                },
                onGetFile);
        });

        app.use(options.base, router);
    };
})(module);