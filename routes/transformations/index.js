(function (module) {
    'use strict';

    var express = require('express');
    var Router = express.Router;
    var debug = require('debug')('lwis:transform');
    var _ = require('lodash');
    var uuid = require('uuid');



    module.exports = function (app, options) {
        var router = Router();


        router.get('/admin/tranformations/index', function (req, res) {
            app.get('repo').query(function (model, cb) {
                    return cb(null, model.transforms);
                },
                function (err, transforms) {
                    res.render('transformations/index', {
                        title: 'Tranformations',
                        transformations: _.values(transforms),
                    });
                });
        });
        router.get('/admin/tranformations/new', function (req, res) {
            res.render('transformations/edit', {
                title: 'Tranformations',
                transformation: {
                },
                errors: {},
                postLink: 'edit/' + uuid.v4()
            });
        });
        router.get('/admin/tranformations/edit/:id', function (req, res) {
            app.get('repo').query(function (model, cb) {
                    return cb(null, model.transforms[req.params.id]);
                },
                function (err, t) {
                    if (!t) {
                        return next();
                    }
                    res.render('transformations/edit', {
                        title: 'Tranformations',
                        transformation: t,
                        errors: {}
                    });
                });
        });
        router.post('/admin/tranformations/edit/:id', function (req, res, next) {
            req.checkBody('name', 'Please give a good solid name').notEmpty();
            req.checkBody('description', 'Describing is understanding. Go ahead...').notEmpty();
            req.checkBody('route', 'Lets give it a proper route!').notEmpty();
            req.checkBody('transform', 'Please add bacon').notEmpty();

            var data = {
                id: req.params.id,
                name: req.body.name,
                description: req.body.description,
                route: req.body.route,
                transform: req.body.transform
            };
            var errors = req.validationErrors(true);
            if (errors) {
                return res.render('transformations/edit', {
                    title: 'Tranformations',
                    transformation: data,
                    errors: errors || {}
                });
            }

            app.get('repo').execute('update-transform', data,
                function (err, t) {
                    if (!t) {
                        return next(err);
                    }
                
                    res.render('transformations/edit', {
                        title: 'Tranformations',
                        transformation: t,
                        errors: {}
                    });
                });
        });


        app.use('/', router);


        // Trigger changes in the repo
        // Out action is to toss away all existing dynamic routes
        // TODO: Improvements?
        app.get('repo').on('executed', function onRepositoryChanged(data) {
            if (data.command.indexOf('transform') >= 0) {
                debug('rebuilding routes');
                applyDynamicTransformations();
            }
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

                        var handler = app.get('transform').createHandler(transform);

                        router.get(transform.route, function (req, res, next) {
                            if (!revision.valid) {
                                return next();
                            }
                            handler(req, res, next);
                        });
                    });

                });
        };
    };
})(module);