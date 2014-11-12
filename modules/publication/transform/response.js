(function(module) {
  'use strict';
  var classBuilder = require('ryoc');
  var accepts = require('accepts');
  var imageTransformer = require('./image-transformer');

  var Response = classBuilder()
    .construct (function response(req) {
      this._req = {
        headers: {
          'accept': req.headers.accept
        }
      };
    })
    .method('accepts', function (mimetype) {
      return accepts(this._req, mimetype);
    })
    .method('image', function image(format) {
      return imageTransformer(format);
    })
    .toClass();

  module.exports = Response;

})(module);
