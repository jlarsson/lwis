(function(module) {
  'use strict';

  var express = require('express');
  var path = require('path');
  var marko = require('marko');

  var globalTemplateCache = {};

  module.exports = function(dirname) {

    var localTemplateCache = {};

    function useRoute(app, path) {
      var router = new express.Router({strict: true});
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

      return function(req, res) {
        res.set('Content-Type', 'text/html; charset=utf-8');

        if (model instanceof Function) {
          return model(req, function(err, data) {
            return template.render(data, res);
          })

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
