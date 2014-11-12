(function (module){
    'use strict';
    
    var gm = require('gm');
    var debug = require('debug')('lwis:gm-extractor');

    function extract(app, options, cb){
        var metadata = options.metadata;
        
        if ((metadata.mimetype||'').indexOf('image/') !== 0){
            debug('skipping mimetype %s', metadata.mimetype);
            return cb();
        }
        
        
        gm(options.path).size(function (err, size){
            if (err){
                debug('error: %j', err);
                return cb(err);
            }
            debug('image size: %j', size);
            var imd = metadata.image || (metadata.image = {});
            imd.width = size.width;
            imd.height = size.height;
            cb();
        });
    };
    
    
    module.exports = extract;

})(module);