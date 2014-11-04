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

        app.use(options.base, router);
    };
})(module);