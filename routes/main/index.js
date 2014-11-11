(function (module) {
    'use strict';

    var express = require('express');
    var Router = express.Router;
    var creditsto = require('credits-to');
    var _ = require('lodash');


    var licenses = [];

    creditsto(function (err, credits){
      if (!err){
        licenses = _(credits.npm).values().concat(_.values(credits.bower))
        .sortBy('name').value();
        //console.log(JSON.stringify(licenses,null,2))
      }
    });


    module.exports = function (app, options) {
        var router = Router();
        router.get('/', function (req, res) {
            return res.render('main/index', {
                title: 'lwis'
            });
        });

        router.get('/licenses', function (req,res){
            return res.render('main/licenses',{
                title: 'Licenses',
                licenses: licenses
            });
        });

        app.use(options.base, router);
    };
})(module);
