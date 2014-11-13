(function(module) {
  'use strict';

var mapReduceParser = require('./mapreduce-parser');
  var filterTransformParser = require('./filtertransform-parser');

  module.exports = function configureScripting(app, options) {
    app.set('filter-transform-parser', filterTransformParser);
    app.set('map-reduce-parser', mapReduceParser);
  };
})(module);
