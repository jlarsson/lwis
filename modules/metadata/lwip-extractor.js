(function (module){
    'use strict';
    
    var lwip = require('lwip');
    var mime = require('mime');
    var debug = require('debug')('lwis:lwip-extractor');

    var lwipExtensions = {
        "jpg": 1,
        "jpeg": 1,
        "png": 1
    };
    function extract(app, options, cb){
        var metadata = options.metadata;
        var extension = mime.extension(metadata.mimetype);
        
        if (lwipExtensions[extension] !== 1){
            debug('skipping %s', extension);
            return cb();
        }
        
        lwip.open(options.path, extension, function onOpen(err, image){
            if (err){
                debug('error: %j', err);
                return cb(err);
            }
        
            if (image){
                debug('image: %j', image);
                var imd = metadata.image || (metadata.image = {});
                imd.width = image.width();
                imd.height = image.height();
            }
            cb();
        });
        
    };
    
    
    module.exports = extract;

})(module);