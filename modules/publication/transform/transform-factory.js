(function (module){
    var classBuilder = require('ryoc');
    var gmTransform = require('./gm-transform');
    
    var Klass = classBuilder()
        .method('image', function (){
            return gmTransform();
        })
        .toClass();

    module.exports = Klass;
    
})(module);