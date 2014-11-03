(function (module) {
    'use strict';

    var express = require('express');
    var Router = express.Router;
    var debug = require('debug')('lwis:transform');
    var _ = require('lodash');



    module.exports = function (app, options) {
        var router = Router();


        router.get('/admin/tranformations/index', function (req, res) {
            app.get('repo').query(function (model, cb) {
                    return cb(null, model.transforms);
                },
                function (err, transforms) {
                    res.render('transformations/index', {
                        title: 'Tranformations',
                        transformations: _.values(transforms)
                    });
                });
        });
        router.get('/admin/tranformations/edit/:id', function (req, res) {
            app.get('repo').query(function (model, cb) {
                    return cb(null, model.transforms[req.params.id]);
                },
                function (err, t) {
                    if (!t){
                        return next();
                    }
                    res.render('transformations/edit', {
                        title: 'Tranformations',
                        transformation: t
                    });
                });
        });
        router.post('/admin/tranformations/edit/:id', function (req, res) {
            app.get('repo').query(function (model, cb) {
                    return cb(null, model.transforms[req.params.id]);
                },
                function (err, t) {
                    if (!t){
                        return next();
                    }
                    res.render('transformations/edit', {
                        title: 'Tranformations',
                        transformation: t
                    });
                });
        });

        
        app.use('/', router);


        // Trigger changes in thee repo
        // Out action is to toss away all existing dynamic routes
        // TODO: Improvements?
        app.get('repo').on('executed', function onRepositoryChanged() {
            applyDynamicTransformations();
        });



        var dynamicTranformationRevision = {
            valid: true
        };
        applyDynamicTransformations();


        function applyDynamicTransformations() {
            // Invalidate all existing transformations
            dynamicTranformationRevision.valid = false;

            var revision = dynamicTranformationRevision = {
                valid: true
            };


            app.get('repo').query(function (model, cb) {
                    return cb(null, model.transforms);
                },
                function (err, transforms) {
                    _(transforms).each(function (transform) {
                        debug('applying transform %j', transform);

                        var handler = app.get('transform').createHandler(transform.transform);

                        router.get(transform.route, function (req, res, next) {
                            if (!revision.valid) {
                                next();
                            }
                            handler(req, res, next);
                        });
                    });

                });
        };
    };
})(module);