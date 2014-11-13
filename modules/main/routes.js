(function(module) {
  'use strict';

  var express = require('express');
  var routeHelper = require('../shared/route-helper')(__dirname);

  var creditsto = require('credits-to');
  var _ = require('lodash');

  var _credits = [];

  creditsto(function(err, c) {
    if (err) {
      throw err;
    }
    if (!err) {
      _credits = _(c.npm).values().concat(_.values(c.bower))
        .sortBy('name').value();
    }
  });

  module.exports = function(app, options) {
    var router = new express.Router();
    app.use('/lwis', router);
    router
      .get('/index', routeHelper.html('./views/index.marko', {
        title: 'lwis'
      }))
      .get('/credits', routeHelper.html('./views/credits.marko', function(cb) {
        cb(null, {
          title: 'Credits',
          credits: _credits
        });
      }));
  }
})(module);
