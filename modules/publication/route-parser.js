(function (module) {
    'use strict';
    var _ = require('lodash');

    // from http://www.w3schools.com/js/js_reserved.asp
    var reservedJavascripWords = {
        "abstract": true,
        "arguments": true,
        "boolean": true,
        "break": true,
        "byte": true,
        "case": true,
        "catch": true,
        "char": true,
        "class": true,
        "const": true,
        "continue": true,
        "debugger": true,
        "default": true,
        "delete": true,
        "do": true,
        "double": true,
        "else": true,
        "enum": true,
        "eval": true,
        "export": true,
        "extends": true,
        "false": true,
        "final": true,
        "finally": true,
        "float": true,
        "for": true,
        "function": true,
        "goto": true,
        "if": true,
        "implements": true,
        "import": true,
        "in": true,
        "instanceof": true,
        "int": true,
        "interface": true,
        "let": true,
        "long": true,
        "native": true,
        "new": true,
        "null": true,
        "package": true,
        "private": true,
        "protected": true,
        "public": true,
        "return": true,
        "short": true,
        "static": true,
        "super": true,
        "switch": true,
        "synchronized": true,
        "this": true,
        "throw": true,
        "throws": true,
        "transient": true,
        "true": true,
        "try": true,
        "typeof": true,
        "var": true,
        "void": true,
        "volatile": true,
        "while": true,
        "with": true,
        "yield": true
    };


    // reserved words by our framework
    var reserverWords = {
        "filter": true,
        "transform": true
    };

    function isValidParameterName(parameterName) {
        if (reservedJavascripWords.hasOwnProperty(parameterName)) return false;
        if (reserverWords.hasOwnProperty(parameterName)) return false;
        try {
            var f = new Function(parameterName, 'return 1234');
            return 1234 == f(1);
        } catch (e) {
            return false;
        }
    }

    module.exports = function routeParser(route) {
        function makeInvalid(errorMessage) {
            return {
                valid: false,
                errorMessage: errorMessage
            };
        }

        if (!_.isString(route)) {
            return makeInvalid('Internal error');
        }

        // route must start with '/'
        if (route.charAt(0) != '/') {
            return makeInvalid('A route must start with /');
        }

        var parts = route.substring(1).split('/');

        // a route may end in /
        if (parts[parts.length - 1] == '') {
            parts.pop();
        }

        if (parts.length === 0) {
            return makeInvalid('Route is empty');
        }

        // no part may be empty
        if (!_.all(parts)) {
            return makeInvalid('A route must not contain empty parts (ie //)');
        }

        // extract parameters
        var params = _(parts).filter(function (p) {
            return p.charAt(0) == ':';
        }).map(function (p) {
            return p.substring(1);
        }).value();

        // are all parameters valid?
        var invalidParams = _.filter(params, function (p) {
            return !(p && isValidParameterName(p));
        });
        if (invalidParams.length > 0) {
            return makeInvalid('Invalid parameter \':' + invalidParams[0] + '\'');
        }

        // are all parameters distinct?
        var duplicates = _(params).countBy().filter(function (count) { return count > 1; }).map(function (v) { return v; }).value();
        if (duplicates.length > 0){
            return makeInvalid('Invalid parameter \':' + duplicates[0] + '\'');
        }

        return {
            valid: true,
            params: params
        };
    };

})(module);