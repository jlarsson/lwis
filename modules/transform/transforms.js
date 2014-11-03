(function (module) {
    'use strict';
    var ryoc = require('ryoc');

    var Transform = ryoc()
        .construct(function (name, args) {
            this.name = name;
            this.args = args;
        })
        .method("transform", function (context){
            context.gm = context.gm[this.name].call(context.gm,this.args);
        })
        .toClass();

    module.exports = {
        Transform: Transform
    };
})(module);