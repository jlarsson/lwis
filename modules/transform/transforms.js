(function (module) {
    'use strict';
    var ryoc = require('ryoc');
    var _ = require('lodash');

    var Transform = ryoc()
        .construct(function (name, args) {
            this.name = name;
            this.args = args;
        })
        .method("transform", function (context) {
            var args = _(this.args).map(function (a) {
                    return a.evaluate(context);
                }).value();
            context.gm = context.gm[this.name].apply(context.gm, args);
        })
        .method("describe", function (context) {
            return [
                this.name, '(',
                _(this.args).map(function (a) {
                    return a.describe();
                }).value().join(','),
                ')'].join('');
        })
        .toClass();

    module.exports = {
        Transform: Transform
    };
})(module);