(function (module) {
    'use strict';
    
    var express = require('express');
    var Router = express.Router;
    
    module.exports = function (app, options) {
        var router = Router();
        router.get('/', function (req, res) {
            res.render('main/index', {
                title: 'lwis'
            });
        });

        app.use(options.base, router);
    };
})(module);