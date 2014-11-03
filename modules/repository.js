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
                    description: 'Thumbnail for the administrative pages',
                    route: '/admin/tn/:id',
                    transform: 'when toLower({id}) == toLower(:id) then resize(64,64)'
                }/*,
                'product-image': {
                    route: '/product/:id',
                    transform: 'when len(:id) > 3 && contains({file.name},:id) then resize(800,800)'
                },
                'product-small-image': {
                    route: '/psmall/:id',
                    transform: 'when len(:id) > 3 && contains({file.name},:id) then resize(128,128)'
                }*/
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

        app.set('repo', repository);
    };

})(module);