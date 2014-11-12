(function (module) {
    'use strict';

    var fs = require('fs');
    var fspath = require('path');
    var vm = require('vm');
    var _ = require('lodash');
    var uuid = require('uuid');
    var classBuilder = require('ryoc');

  var Script = classBuilder()
      .construct(function (options, params) {
          this.options = options;
          this.params = params;
          this.glob = {};
          this.context = {};
          this.glob[this.options.globalName] = this.context;
      })
      .method('filter', function (list) {
          if (this.options.hasFilter) {
              this.context.command = 'applyFilter';
              this.context.filter = {
                self: list,
                args: []
              };
              this.context.params = this.params;
              return this.options.vmScript.runInNewContext(this.glob);
          }
          return [];
      })
      .method('transform', function (self, args) {
          if (this.options.hasTransform) {
              this.context.command = 'applyTransform';
              this.context.transform = {
                self: self,
                args: args||[]
              };
              this.context.params = this.params;
              return this.options.vmScript.runInNewContext(this.glob);
          }
          return null;
      })
      .toClass();

  var Parsing = classBuilder()
      .construct(function (options) {
          this.options = options;
      })
      .getter('valid', function (){ return this.options.hasFilter && !this.options.error; })
      .getter('error', function () { return this.options.error; })
      .getter('hasFilter', function () { return this.options.hasFilter; })
      .getter('hasTransform', function () { return this.options.hasTransform; })
      .method('createScript', function (params) {
          return new Script(this.options, params);
      })
      .toClass();

  var transformScriptTemplate = fs.readFileSync(fspath.resolve(__dirname,'transform-script-template.txt'), {encoding: 'utf-8'});

  function createVmScript(scriptData) {
      var initparameterNamesCode = _.map(scriptData.parameterNames, function (p){
        return 'var ' + p + ' = arguments[0].params["' + p + '"];';
      }).join('');

      // Modify temlate, order of application is important (last to first)
      var scriptCode = transformScriptTemplate
        .replace('$global$', scriptData.globalName)
        .replace('$user-code$', scriptData.code)
        .replace('$param-initialization$', initparameterNamesCode);

      //console.log(scriptCode);
      return vm.createScript(scriptCode);
  }


    module.exports = function scriptParser(code, parameterNames) {
      var scriptData = {
        code: code,
        parameterNames: parameterNames,
        globalName: 'g_' + uuid.v4().split('-').join('')
      };
      var vmScript = null;
      var parsingError = null;
      try {
          vmScript = createVmScript(scriptData);
      } catch (e) {
          parsingError = e;
      }

        function diagnoseScript(vmScript, command) {
            var secret = {};
            var glob = {};
            var secret = uuid.v4();
            var context = {
              command: command,
              secret: secret
            }
            glob[scriptData.globalName] = context;
            return vmScript.runInNewContext(glob) === secret;
        };

      var parsing = new Parsing({
        vmScript: vmScript,
        error: parsingError,
        globalName: scriptData.globalName,
        parameterNames: parameterNames,
        hasFilter: vmScript && diagnoseScript(vmScript, 'getFilter'),
        hasTransform: vmScript && diagnoseScript(vmScript, 'getTransform')
      });
      return parsing;
    };

})(module);
