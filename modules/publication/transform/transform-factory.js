(function (module){
    var classBuilder = require('ryoc');
    var gmTransform = require('./gm-transform');
    
    var Klass = classBuilder()
        .method('image', function (format){
            return gmTransform(format);
        })
        .toClass();

    module.exports = Klass;
    
})(module);