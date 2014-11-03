(function (module) {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var parser = require('./transform-parser');
    var debug = require('debug')('lwis:transform');

    /*
    var parsed = parser.parse('when {id} == :id && 1 > 2 then autoOrient() and resize(100,100)', {
        require: require
    });
    console.log('%j', parsed);
*/
    module.exports = function (app, options) {
        app.set('transform', {
            createHandler: function (transform) {

                debug('constructing route handler for %s', transform);
                var parsed = parser.parse(transform);

                return function (req, res, next) {
                        debug('trying to handle route with %s', transform);
                    return next();

                    app.get('repo').query(function (model, cb) {
                        debug('trying to handle route with %s', transform);
                        
                            var context = {};
                            return cb(_(model.files).filter(function (file) {
                                debug('testing %j', file);
                                context.current = file;
                                return parsed.filter.evaluate(context);
                            }).value());
                        },
                        function (err, files) {
                            debug('matching files: %j', files);
                        
                            next();
                        });

                }
            }
        });
    };
})(module);