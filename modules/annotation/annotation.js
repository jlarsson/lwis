(function(module) {
  'use strict';

  module.exports = function(app, options) {
    require('./annotation-validator')(app, options);
    require('./routes')(app, options);
  };
})(module);
