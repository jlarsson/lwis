(function (module) {
    'use strict';
    var classBuilder = require('ryoc');
    var typeis = require('type-is');
    var _ = require('lodash');

    var Klass = classBuilder()
        .construct(function (file) {
            this.data = file;
        })
        .method('is', function (mimetype) {
            var req = {
                headers: {
                    'content-type': this.data.mimetype || '',
                    'transfer-encoding': 'chunked'
                }
            };
            return typeis(req, mimetype);
        })
    .toClass();
    
    
    module.exports = Klass;

})(module);