(function(module) {
  'use strict';

  var express = require('express');
  var path = require('path');
  var marko = require('marko');

  var globalTemplateCache = {};

  module.exports = function(dirname) {

    var localTemplateCache = {};

    function useRoute(app, path) {
      var router = new express.Router({
        strict: true
      });
      app.use(path, router);
      return router;
    }

    function html(templatePath, model) {

      var template = localTemplateCache[templatePath];
      if (!template) {
        var resolvedTemplatePath = path.resolve(dirname, templatePath);
        template = globalTemplateCache[resolvedTemplatePath];

        if (!template) {
          template = marko.load(resolvedTemplatePath);
          globalTemplateCache[resolvedTemplatePath] = template;

        }
        localTemplateCache[templatePath] = template;
      }

      return function(req, res, next) {
        res.set('Content-Type', 'text/html; charset=utf-8');

        if (model instanceof Function) {
          var cb = function(err, data) {
            if (err) {
              return next(err);
            }
            return template.render(data, res);
          };
          if (model.length == 1) {
            return model(cb);
          }
          if (model.length == 2) {
            return model(req, cb);
          }
          if (model.length == 3) {
            return model(req, res, cb);
          }
          if (model.length == 4) {
            return model(req, res, next, cb);
          }
          console.log('applying default...')
          cb(null, model());

          /*
          return model(req, function(err, data) {
            if (err){
              return next(err);
            }
            return template.render(data, res);
          })*/
        }
        return template.render(model, res);
      }
    }

    return {
      useRoute: useRoute,
      html: html
    };
  }
})(module);
