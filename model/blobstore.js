(function (module){
    'use strict';
    
    var path = require('path');
    var blobstore = require('blobstore');
    module.exports = function (cfg){
        var bs = blobstore.createFileBlobStore(path.resolve(cfg.get('appdata_path'), 'blobs'));
        cfg.set('blobstore', bs);
    };
})(module);