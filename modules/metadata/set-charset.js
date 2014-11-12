(function (module){
    'use strict';
    
    var chardet = require('chardet');
    var debug = require('debug')('lwis:gm-extractor');

    function extract(app, options, cb){
        var metadata = options.metadata;
        
        if ((metadata.mimetype||'').indexOf('text/') !== 0){
            return cb();
        }
        
        chardet.detectFile(options.path, function (err, encoding){
            if (err){
                debug('error: %j', err);
                return cb(err);
            }
            if (encoding){
                metadata.charset = encoding;
            }
            cb();
        });
    };
    
    
    module.exports = extract;

})(module);