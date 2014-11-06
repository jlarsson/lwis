(function (module) {
    'use strict';

    var _ = require('lodash');

    module.exports = function (route) {
        return {
            params: _((route || '').split('/'))
                .filter()
                .filter(function (s) {
                    return s[0] == ':';
                })
                .map(function (p) {
                    return p.substring(1);
                })
                .filter()
                .value()
        };
    };
})(module);