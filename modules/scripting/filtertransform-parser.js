(function(module) {
  'use strict';

  var parser = require('./parser');
  var classBuilder = require('ryoc');
  var debug = require('debug')('lwis:scripting');
  var fs = require('fs');

  var scriptTemplate = fs.readFileSync(require.resolve('./filtertransform-script-template.js'), {
    encoding: 'utf-8'
  });

  var FilterTransformScriptParsing = classBuilder()
    .inherit(parser.AbstractScriptParsing)
    .construct(function(options) {
      parser.AbstractScriptParsing.call(this, options);
      if (!(this.options.error || this.options.has.filter)){
        this.options.error = new Error('The script must atleast have a filter() function');
      }
    })
    .getter('valid', function() {
      return (this.error == null) && this.options.has.filter;
    })
    .getter('hasFilter', function() {
      return this.options.has.filter;
    })
    .getter('hasTransform', function() {
      return this.options.has.transform;
    })
    .toClass();

  var FilterTransformScript = classBuilder()
    .inherit(parser.AbstractScript)
    .construct(function(options, params) {
      parser.AbstractScript.call(this, options, params);
    })
    .getter('valid', function() {
      return (this.error == null) && this.options.has.filter;
    })
    .method('filter', function(list) {
      return this.applyUserFunction('filter', list, []);
    })
    .method('transform', function (self,args){
      return this.applyUserFunction('transform', self, args);
    })
    .toClass();

  module.exports = function(scriptCode, parameterNames) {
    debug('parsing %s', scriptCode);

    return parser().parse({
      template: scriptTemplate,
      scriptCode: scriptCode,
      parameterNames: parameterNames || [],
      parsingClass: FilterTransformScriptParsing,
      scriptClass: FilterTransformScript,
      functionNames: ['filter', 'transform']
    });
  };
})(module);
