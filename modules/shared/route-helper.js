(function(module) {
  'use strict';

  var path = require('path');
  var marko = require('marko');

  var globalTemplateCache = {};

  module.exports = function(dirname) {

    var localTemplateCache = {};

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
        console.dir(model);

        if (model instanceof Function) {
          return model(function(err, data) {
            return template.render(data, res);
          })

        }
        return template.render(model, res);
      }
    }

    return {
      html: html
    };
  }
})(module);
