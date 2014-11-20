(function(module) {
  'use strict';

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

    routeHelper.useRoute(app, '/')
      .get('/', function(req, res) {
        return res.redirect('/lwis');
      })
      .get('/lwis', routeHelper.html('./views/index.marko', {
        title: 'lwis'
      }))
      .get('/lwis/credits', routeHelper.html('./views/credits.marko', function(req, cb) {
        cb(null, {
          title: 'Credits',
          credits: _credits
        });
      }));
  }
})(module);
