(function (module) {
    'use strict';

    var highlander = require('highlander');
    var ryoc = require('ryoc');
    var path = require('path');
    var debug = require('debug')('lwis:repository');

    var Model = ryoc()
        .construct(function () {
            this.files = [];
            this.filesById = {};
            
            this.transforms = {
                '58a13e35-580b-4978-9efc-02dbcc2cf46f': {
                    id: '58a13e35-580b-4978-9efc-02dbcc2cf46f',
                    name: 'lwis default Thumbnails',
                    description: 'Thumbnails for the administrative pages',
                    route: '/admin/tn/:id',
                    transform: 'function filter () { return this.id == id; }\nfunction transform(){ return this.resize(64,64); }'
                },
                '6d781f94-a454-4f64-b17d-9200c0116167': {
                    id: '6d781f94-a454-4f64-b17d-9200c0116167',
                    name: 'lwis default Downloads',
                    description: 'Downloads for the administrative pages',
                    route: '/admin/dl/:id',
                    transform: 'function filter () { return this.id == id; }'
                }
            };
        })
        .method('getFileById', function (id) {
            return this.filesById[id] || null;
        })
        .method('getAllFiles', function () {
            return this.files;
        })
        .method('addFile', function (data) {
            this.files.push(data);
            this.filesById[data.id] = data;
            return data;
        })
        .method('updateTransform', function (data) {
            this.transforms[data.id] = data;
            return data;
        })
        .toClass();

    module.exports = function (app, options) {
        var folder = path.resolve(app.get('appdata'), '.repo/.journal');
        debug('using repository in %s', folder);
        
        var repository = highlander.repository({
            model: new Model(),
            journal: highlander.fileJournal({
                path: folder
            })
        });

        repository.registerCommand('add-file', function (ctx, cb) {
            return cb(null, ctx.model.addFile(ctx.args));
        });

        repository.registerCommand('update-transform', function (ctx, cb) {
            return cb(null, ctx.model.updateTransform(ctx.args));
        });
        
        app.set('repo', repository);
    };

})(module);