(function (module) {
    'use strict';

    var path = require('path');
    var blobstore = require('blobstore');
    var debug = require('debug')('lwis:blobstore');

    module.exports = function (app, options) {
        var folder = path.resolve(app.get('appdata'), '.blobs')
        debug('using blobstore in %s', folder);
        var bs = blobstore.createFileBlobStore(folder);
        app.set('blobstore', bs);
    };
})(module);