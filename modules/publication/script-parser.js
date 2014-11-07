(function (module) {

    var vm = require('vm');
    var _ = require('lodash');
    var classBuilder = require('ryoc');

    module.exports = function scriptParser(code, params) {

        var globalName = '__lwis__script__args__';

        var ScriptClass = classBuilder()
            .construct(function (script, options) {
                this.script = script;
                this.options = options;
                this.context = context;
            })
            .method('filter', function (list) {
                if (this.options.hasFilter) {
                    this.context[globalName].command = 'applyFilter';
                    this.context[globalName].list = list;
                    return this.script.runInNewContext(this.context);
                }
            })
            .method('transform', function (self, args) {
                if (this.options.hasTransform) {
                    this.context[globalName].command = 'applyTransform';
                    this.context[globalName].self = self;
                    this.context[globalName].args = args;
                    return this.script.runInNewContext(this.context);
                }
            })
            .toClass();

        var ParsingKlass = classBuilder()
            .construct(function (script) {
                this.script = script;
            })
            .property('hasFilter')
            .property('hasTransform')
            .method('createScript', function () {
                return new ScriptClass(this.script, {
                    hasFilter: this.hasFilter,
                    hasTransform: this.hasTtransform
                });
            })
            .toClass();

        function createScript(code) {
            var scriptTemplate = '(function () { \'use strict\'; $params $code \
            ;switch (arguments[0].command){ \
                case "applyFilter": return arguments[0].list.filter(function(){return filter.call(arguments[0]);}); \
                case "getFilter": try { return (filter instanceof Function) ? arguments[0].secret : null; } catch(e){ if (!(e instanceof ReferenceError)) throw e; return undefined; }\
                case "getTransform": try { return (transform instanceof Function) ? arguments[0].secret : null; } catch(e){ if (!(e instanceof ReferenceError)) throw e; return undefined; }\
                case "applyTransform": return transform.apply(arguments[0].self, arguments[0].args); \
            } })(__lwis__script__args__);';

            var scriptCode = scriptTemplate.replace('$params', _.map(params, function (p) {
                    return 'var ' + p + ' = arguments[0].params["' + p + '"];'
                }).join(''))
                .replace('$code', code);

            return vm.createScript(scriptCode);
        }

        var script;
        var parsingError = null;
        try {
            script = createScript(code);
        } catch (e) {
            if (!(e instanceof SyntaxError)) {
                throw e;
            }
            script = createScript('');
            parsingError = e;
        }

        function diagnoseScript(script, command) {
            var secret = {};
            var glbl = {};
            glbl[globalName] = {};
            glbl[globalName].command = command;
            glbl[globalName].secret = secret;
            glbl[globalName].params = {};
            return script.runInNewContext(glbl) === secret;
        };

        var parsing = new ParsingKlass(script);
        parsing.error = parsingError;
        parsing.hasFilter = diagnoseScript(script, 'getFilter');
        parsing.hasTransform = diagnoseScript(script, 'getTransform');
        return parsing;

    };

})(module);