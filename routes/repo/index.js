(function (module) {
    'use strict';
    
    var express = require('express');
    var Router = express.Router;
    var debug = require('debug')('lwis:repository');
    var filesize = require('filesize');
    
    module.exports = function (app, options) {
        var router = Router();
        router.get('/', function (req, res) {
            return res.redirect('./index');

        });
        router.get('/index', function (req, res) {

            req.app.get('repo').query(function (model, cb) {
                    cb(null, model.getFiles());
                },
                function (err, files) {
                    res.render('repo/index', {
                        title: 'Repository',
                        files: files,
                        formatSize: filesize
                    });
                });
        });
        router.get('/details/:id', function (req, res) {

            req.app.get('repo').query(function (model, cb) {
                    cb(null, model.getFile(req.params.id));
                },
                function (err, file) {
                    if (err) return next(err);
                    res.render('repo/details', {
                        title: file.name,
                        file: file,
                        formatSize: filesize
                    });
                });
        });

        app.use(options.base, router);
    };
})(module);