(function(module) {
  'use strict';

  var parser = require('./parser');
  var classBuilder = require('ryoc');
  var debug = require('debug')('lwis:scripting');
  var fs = require('fs');

  var scriptTemplate = fs.readFileSync(require.resolve('./mapreduce-script-template.js'), {
    encoding: 'utf-8'
  });

  var MapReduceScriptParsing = classBuilder()
    .inherit(parser.AbstractScriptParsing)
    .construct(function(options) {
      parser.AbstractScriptParsing.call(this, options);
      if (!(this.options.error || this.options.has.map)){
        this.options.error = new Error('The script must have a map() function');
      }
      if (!(this.options.error || this.options.has.reduce)){
        this.options.error = new Error('The script must have a reduce() function');
      }
    })
    .getter('valid', function() {
      return (this.error == null) && this.options.has.map && this.options.has.reduce;
    })
    .toClass();

  var MapReduceScript = classBuilder()
    .inherit(parser.AbstractScript)
    .construct(function(options, params) {
      //debug('MapReduceScript(%j,%j)', options, params);

      parser.AbstractScript.call(this, options, params);
    })
    .getter('valid', function() {
      return (this.error == null) && this.options.has.map && this.options.has.reduce;
    })
    .method('mapReduce', function(list) {
      this.context.emitted = [];
      this.applyUserFunction('map', list, []);
      return this.applyUserFunction('reduce', null, [this.context.emitted]);
    })
    .toClass();



  module.exports = function(scriptCode, parameterNames) {

    debug('parsing %s', scriptCode);

    return parser().parse({
      template: scriptTemplate,
      scriptCode: scriptCode,
      parameterNames: parameterNames || [],
      parsingClass: MapReduceScriptParsing,
      scriptClass: MapReduceScript,
      functionNames: ['map', 'reduce']
    });
  };
})(module);
