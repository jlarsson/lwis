(function(module) {
  'use strict';

  var routeHelper = require('../shared/route-helper')(__dirname);
  var _ = require('lodash');

  var skins = _.reduce([
    'cerulean', 'cosmo', 'cyborg', 'darkly', 'flatly',
    'journal', 'lumen', 'paper', 'readable', 'sandstone',
    'simplex', 'slate', 'spacelab', 'superhero', 'united',
    'yeti'],
    function(agg, skin) {
      agg[skin] = 'http://maxcdn.bootstrapcdn.com/bootswatch/3.3.0/'+ skin + '/bootstrap.min.css';
      return agg;
    }, {});

  module.exports = function(app, options) {

    var base = '/lwis/skin';

    routeHelper.useRoute(app, base)
      .get('/custom.css', function(req, res) {

        var skin = req.cookies.skin || '';
        var skinUrl = skins[skin];
        if (skinUrl){
          return res.redirect(skinUrl);
        }
        res.set('Content-Type', 'text/css');
        return res.send('')
      })
      .post('/setcustom', function (req,res){
          var skin = req.body.skin;
          var skinUrl = skins[skin];
          if (skinUrl){
            res.cookie('skin', skin, { httpOnly: true });
          }
          else{
            res.clearCookie('skin');
          }
          return res.send(skin);
      });
  }
})(module);
