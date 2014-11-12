(function (module){
    'use strict';
    
    var path = require('path');
    var mkdirp = require('mkdirp');
    var config = require('config');
    var debug = require('debug')('lwis');
    var _ = require('lodash');
    var ryoc = require('ryoc');
    
    var Klass = ryoc()
        .construct(function (app){
            this.app = app;
        })
        .method('configure', function (){
            var self = this;
            
            var cfg = config.get('lwis');

            debug('configure started');
            
            // Configure folders
            var basedir = path.dirname(require.main.filename);
            _(cfg.folders).each(function (folder, name){
                var p = path.resolve(basedir,folder);
                debug('%s=%s', name, p);
                self.app.set(name, p);
                
                mkdirp(p, function (err){
                    if (err){
                        debug('failed to create folder %s: %j', p, err);
                    }
                });
            });
            
            // load all modules
            _(cfg.modules).each(function (options, key){
                // load module relative to main
                debug('configuring module %s', key);
                var m = require.main.require(key)(self.app, options);
            });

            // load all routes
            _(cfg.routes).each(function (options, key){
                // load module relative to main
                debug('configuring route %s', key);
                var m = require.main.require(key)(self.app, options);
            });
            
            debug('configure done');
        })
        .toClass();
    
    
    module.exports = Klass;
    
})(module);