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
                "admin-thumbnail": {
                    route: "/tn/:assetid",
                    transform: "when {id} == :assetid then resize(128,128)"
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