(function (module) {
    'use strict';
    var classBuilder = require('ryoc');
    var typeis = require('type-is');
    var _ = require('lodash');

    var TransformItem = classBuilder()
        .construct(function transformItem(data) {
            this.data = data;
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


    module.exports = TransformItem;

})(module);
