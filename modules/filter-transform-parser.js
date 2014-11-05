(function () {
    var _ = require('lodash');
    
    module.exports = function (code,params) {
        var prolog = '\'use strict\';';
        prolog += _.map(params, function(p) { return 'var ' + p + ' = arguments[0].params["' + p + '"];'}).join('');

        var epilog = '\
        switch (arguments[0].command){ \
            case "applyFilter": return arguments[0].filterList.filter(function(){return filter.call(arguments[0]);}); \
            case "getFilter": try { return filter; } catch(e){ if (!(e instanceof ReferenceError)) throw e; return undefined; }\
            case "getTransform": try { return transform; } catch(e){ if (!(e instanceof ReferenceError)) throw e; return undefined; }\
            case "applyTransform": return transform.call(arguments[0].transformData); \
        }';

        var body = prolog + code + epilog;
        var fn = new Function(prolog + body);
        
        var hasFilter = fn({command:'getFilter', params: {}});
        var hasTransform = fn({command:'getTransform', params: {}});
        
        return {
            hasFilter: hasFilter,
            hasTransform: hasTransform,
            filter: function (list, params) { return hasFilter ? fn({command:'applyFilter',filterList: list, params: params}) : undefined },
            transform: function (data, params) { return hasTransform ? fn({command:'applyTransform',transformData: data, params: params}) : undefined }
        };
        return fn;
    }
})(module);