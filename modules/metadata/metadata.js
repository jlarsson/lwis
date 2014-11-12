(function (module) {
    'use strict';

    var debug = require('debug')('lwis:metadata');
    var _ = require('lodash');
    var async = require('async');

    module.exports = function (app, options) {

        var extractors = [];

        _(options.extractors).each(function (options, key) {
            debug('configuring extractor %s', key);
            var extractor = require.main.require(key);
            extractors.push({
                key: key,
                extractor: extractor
            });
        });

        function extract(options, callback) {

            async.eachSeries(
                extractors,
                function applyExtractor(extractor, cb) {
                    function done(err){
                        if (err){
                            debug('%s: %j', extractor.key, err);
                        }
                        cb();
                    }
                    try{
                        extractor.extractor(app, options, done);
                    }
                    catch(e){
                        done(e);
                    }
                },
                callback);
        }

        // set the global metadata extractor function
        app.set('metadata-extractor', extract)
    };
})(module);
