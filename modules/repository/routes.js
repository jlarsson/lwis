(function(module) {
  'use strict';

  var express = require('express');
  var routeHelper = require('../shared/route-helper')(__dirname);

  var debug = require('debug')('lwis:repository');
  var filesize = require('filesize');

  module.exports = function(app, options) {

    routeHelper.useRoute(app, '/lwis/repository')
      .get('/', function(req, res) {
        return res.redirect('./index');

      })
      .get('/index', routeHelper.html('./views/index.marko', getIndexModel))
      .get('/details/:id', routeHelper.html('./views/details.marko', getDetailsModel));

    function getIndexModel(req, cb) {
      req.app.get('repo').query(function(model, cb) {
          return cb(null, model.getFiles());
        },
        function(err, files) {
          return cb(err, {
            title: 'Repository',
            files: files,
            formatSize: filesize
          });
        });
    }

    function getDetailsModel(req, cb) {
      req.app.get('repo').query(function(model, cb) {
          cb(null, model.getFile(req.params.id));
        },
        function(err, file) {
          return cb(err, {
            title: file.name,
            file: file,
            formatSize: filesize
          });
        });
    };
  };
})(module);
