(function (module) {
    var classBuilder = require('ryoc');
    var accepts = require('accepts');
    var gmTransform = require('./gm-transform');

    var Klass = classBuilder()
        .construct(function (req) {
            this._req = {
                headers: {
                    'accept': req.headers.accept
                }
            };
        })
        .method('accepts', function (mimetype) {
            return accepts(this._req, mimetype);
        })
        .method('image', function (format) {
            return gmTransform(format);
        })
        .toClass();

    module.exports = Klass;

})(module);