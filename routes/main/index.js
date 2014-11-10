(function (module) {
    'use strict';
    
    var express = require('express');
    var Router = express.Router;
    var licenses = require('../../licenses.json');
    var _ = require('lodash');
    
    var lic = _(licenses).map(function (lic,name){
        return {
            name: name.split('@')[0],
            versions: [name.split('@')[1]],
            repository: lic.repository,
            licenses: [lic.licenses]
        }
    
    })
    .groupBy('name')
    .map(function (l){
        //console.log('%j',l);
        
        return _(l).tail().reduce(function(ack,l){
            ack.versions.push(l.versions);
            ack.licenses.push(l.licenses);
            return ack;
        }, l[0]);
    })
    .each(function (l){
        l.versions = _(l.versions).uniq().sort().value();
        l.licenses = _(l.licenses).flatten().uniq().sort().value();
    })
    .value();
    
    //console.log('%j', lic);
    
    
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
                licenses: lic
            });
        });

        app.use(options.base, router);
    };
})(module);