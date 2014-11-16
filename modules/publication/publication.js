(function(module) {
  'use strict';

  module.exports = function(app, options) {

    // Configure modules
    require('./publication-validator')(app, options);
    require('./publication-middleware-factory')(app, options);
    require('./routes')(app, options);
    require('./dynamic-publication-routes')(app, options);

  };
})(module);
