(function(module) {
  'use strict';

  var vm = require('vm');
  var fs = require('fs');
  var uuid = require('uuid');
  var classBuilder = require('ryoc');
  var _ = require('lodash');
  var debug = require('debug')('lwis:scripting');

  var mapReduceScriptTemplate = fs.readFileSync(require.resolve('./mapreduce-script-template.js'), {
    encoding: 'utf-8'
  });

  var AbstractScript = classBuilder()
    .construct(function(options, params) {
      //debug('AbstractScript(%j,%j)', options, params);
      this.options = options;
      this.params = params;
      this.glob = {};
      this.context = {};
      this.glob[this.options.globalName] = this.context;
    })
    .method('applyUserFunction', function(name, self, args) {
      if (this.options.has[name]) {
        this.context.command = name;
        this.context[name] = {
          self: self,
          args: args
        };
        this.context.params = this.params;
        return this.options.vmScript.runInNewContext(this.glob);
      }
    })
    .getter('error', function() {
      return this.options.error;
    })
    .toClass();

  var AbstractScriptParsing = classBuilder()
    .construct(function(options) {
      //debug('AbstractScriptParsing(%j,%j)', options);
      this.options = options;
    })
    .method('createScript', function(params) {
      return this.options.scriptClass(this.options, params || {});
    })
    .toClass();

  var MapReduceScriptParsing = classBuilder()
    .inherit(AbstractScriptParsing)
    .construct(function(options) {
      //debug('MapReduceScriptParsing(%j,%j)', options);

      AbstractScriptParsing.call(this, options);
    })
    .getter('valid', function() {
      return (this.error == null) && this.options.has.map && this.options.has.reduce;
    })
    .toClass();

  var MapReduceScript = classBuilder()
    .inherit(AbstractScript)
    .construct(function(options, params) {
      //debug('MapReduceScript(%j,%j)', options, params);

      AbstractScript.call(this, options, params);
    })
    .getter('valid', function() {
      return (this.error == null) && this.options.has.map && this.options.has.reduce;
    })
    .method('mapReduce', function(list) {
      this.context.emitted = [];
      this.applyUserFunction('map', list, []);
      return this.applyUserFunction('reduce', null, this.context.emitted);
    })
    .toClass();


  var Parser = classBuilder()
    .method('parse', function(options) {
      var options = _.defaults({}, options, {
        globalName: 'g_' + uuid.v4().split('-').join(''),
        has: {}
      });

      //debug('parse: options = %j', options);


      var setupParams = _.map(options.parameterNames, function(p) {
        return 'var ' + p + ' = arguments[0].params["' + p + '"];';
      }).join('');

      // Modify template, order of application is important (last to first)
      var scriptCode = options.template
        .replace('$global$', options.globalName)
        .replace('$userCode$', options.scriptCode)
        .replace('$setupParams$', setupParams);

      //debug('parse: script code = %s', scriptCode);

      try {
        options.vmScript = vm.createScript(scriptCode);

        _(options.functionNames).each(function(name) {
          var glob = {};
          var secret = uuid.v4();
          var context = {
            command: 'get-' + name,
            secret: secret
          }
          glob[options.globalName] = context;
          try {
            //console.log('TESTING %s with %s, got %s', name, secret, options.vmScript.runInNewContext(glob));
            options.has[name] = options.vmScript.runInNewContext(glob) === secret;
          } catch (e) {}
        });

        //console.log(JSON.stringify(options,null,2));

      } catch (e) {
        options.error = e;

        console.log(e);
      }
      return options.parsingClass(options);
    })
    .toClass();

  module.exports = function(scriptCode, parameterNames) {

    debug('parsing %s', scriptCode);

    return new
    Parser().parse({
      template: mapReduceScriptTemplate,
      scriptCode: scriptCode,
      parameterNames: parameterNames || [],
      parsingClass: MapReduceScriptParsing,
      scriptClass: MapReduceScript,
      functionNames: ['map', 'reduce']
    });
  };
})(module);
