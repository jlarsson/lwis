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
            
            this.publications = {
                '58a13e35-580b-4978-9efc-02dbcc2cf46f': {
                    id: '58a13e35-580b-4978-9efc-02dbcc2cf46f',
                    name: 'lwis default Thumbnails',
                    description: 'Thumbnails for the administrative pages',
                    route: '/admin/tn/:id',
                    script: 'function filter () {\n  return this.id === id;\n}\nfunction transform(f){\n  return f.resize(165,165).noProfile();\n}'
                },
                '6d781f94-a454-4f64-b17d-9200c0116167': {
                    id: '6d781f94-a454-4f64-b17d-9200c0116167',
                    name: 'lwis default Downloads',
                    description: 'Downloads for the administrative pages',
                    route: '/admin/dl/:id',
                    script: 'function filter () {\n  return this.id === id;\n}\nfunction transform(f)\n{\n return f.noProfile();\n}'
                }
            };
        })
        .method('getFileById', function (id) {
            return this.filesById[id] || null;
        })
        .method('getAllFiles', function () {
            return this.files;
        })
        .method('addFile', function (file) {
            this.files.push(file);
            this.filesById[file.id] = file;
            return file;
        })
        .method('updatePublication', function (publication) {
            this.publications[publication.id] = publication;
            return publication;
        })
        .method('getPublication', function (id){
            return this.publications[id];
        })
        .method('getPublications', function (){
            return this.publications;
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

        repository.registerCommand('update-publication', function (ctx, cb) {
            return cb(null, ctx.model.updatePublication(ctx.args));
        });
        
        app.set('repo', repository);
    };

})(module);