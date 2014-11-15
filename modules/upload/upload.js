(function(module) {
  'use strict';

  module.exports = function configureUpload(app, options) {
    require('./routes')(app,options);
  };
})(module);
