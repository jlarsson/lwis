(function (module) {
    'use strict';

    var express = require('express');
    var Router = express.Router;
    var debug = require('debug')('lwis:publication');
    var _ = require('lodash');
    var uuid = require('uuid');

    module.exports = function (app, options) {
        var router = Router();

        var publicationValidator = app.get('publication-validator');

        router.get('/admin/publication/index', function (req, res) {
            app.get('repo').query(function (model, cb) {
                    return cb(null, model.getPublications());
                },
                function (err, publications) {
                    res.render('publication/index', {
                        title: 'Publications',
                        publications: _.values(publications),
                    });
                });
        });
        router.get('/admin/publication/new', function (req, res) {
            res.render('publication/edit', {
                title: 'New publication',
                publication: {},
                errors: {},
                postLink: 'edit/' + uuid.v4()
            });
        });
        router.get('/admin/publication/edit/:id', function (req, res, next) {
            app.get('repo').query(function (model, cb) {
                    return cb(null, model.getPublication(req.params.id));
                },
                function (err, publication) {
                    if (!publication) {
                        return next();
                    }
                    res.render('publication/edit', {
                        title: publication.name,
                        publication: publication,
                        errors: publicationValidator.validate(publication) || {}
                    });
                });
        });
        router.post('/admin/publication/edit/:id', function (req, res, next) {

            var publication = {
                id: req.params.id,
                name: req.body.name,
                description: req.body.description,
                route: req.body.route,
                script: req.body.script
            };
            var errors = publicationValidator.validate(publication);
            if (errors) {
                return res.json(errors);
/*
                console.log('%j',errors);
                return res.render('publication/edit-partial', {
                    title: publication.name,
                    publication: publication,
                    errors: errors || {}
                });
*/
            }

            app.get('repo').execute('update-publication', publication,
                function (err, publication) {
                    if (!publication) {
                        return next(err);
                    }
                    return res.json({});
/*
                    res.render('publication/edit-partial', {
                        title: publication.name,
                        publication: publication,
                        errors: {}
                    });
*/
                });
        });


        app.use('/', router);


        // Trigger changes in the repo
        // Out action is to toss away all existing dynamic routes
        // TODO: Improvements?
        app.get('repo').on('executed', function onRepositoryChanged(data) {
            if (data.command.indexOf('publication') >= 0) {
                debug('rebuilding publications');
                applyDynamicPublications();
            }
        });



        var dynamicRevision = {
            valid: true
        };
        applyDynamicPublications();


        function applyDynamicPublications() {
            // Invalidate all existing transformations
            dynamicRevision.valid = false;

            var revision = dynamicRevision = {
                valid: true
            };


            app.get('repo').query(function (model, cb) {
                    return cb(null, model.getPublications());
                },
                function (err, publications) {
                    _(publications).each(function (publication) {
                        debug('applying publication %j', publication);

                        var handler = app.get('publication-middleware-factory')(publication);

                        if (handler) {
                            router.get(publication.route, function (req, res, next) {
                                if (!revision.valid) {
                                    return next();
                                }
                                handler(req, res, next);
                            });
                        }
                    });
                });
        };
    };
})(module);
