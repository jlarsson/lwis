(function (module){
    'use strict';
    
    var classBuilder = require('ryoc');
    
    var AbstractTransform = classBuilder()
        .abstract('__internal_get_signature', function (){})
        .abstract('__internal_apply_transform', function (context,cb){})
        .toClass();
    
    
    module.exports = AbstractTransform;
})(module);