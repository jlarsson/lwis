(function (module) {
    'use strict';

    var express = require('express');
    var Router = express.Router;
    var debug = require('debug')('lwis:transform');
    var _ = require('lodash');



    module.exports = function (app, options) {
        app.get('repo').query(function (model, cb) {
                return cb(null, model.transforms);
            },
            function (err, transforms) {
                if (transforms.length === 0) {
                    return;
                }

                var router = Router();
                _(transforms).each(function (transform) {
                    debug('applying transform %j', transform);
                    router.get(transform.route, app.get('transform').createHandler(transform.transform));
                });

                app.use('/', router);
            });
    };
})(module);