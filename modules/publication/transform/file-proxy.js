(function (module) {
    'use strict';
    var classBuilder = require('ryoc');
    var typeis = require('type-is');
    var _ = require('lodash');

    var Klass = classBuilder()
        .construct(function (file) {
            _.each(file, function (v,k){
                this[k] = v;
            }.bind(this)); 
        })
        .method('is', function (mimetype) {
            var req = {
                headers: {
                    'content-type': this.mimetype || '',
                    'transfer-encoding': 'chunked'
                }
            };
            return typeis(req, mimetype);
        })
    .toClass();
    
    
    module.exports = Klass;

})(module);