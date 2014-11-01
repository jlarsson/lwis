(function (module) {
    'use strict';
    
    var highlander = require('highlander');
    var ryoc = require('ryoc');
    var path = require('path');


    var Model = ryoc()
        .construct(function () {
            this.files = [];
            this.filesById = {};
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

    module.exports = function (cfg) {
        var repository = highlander.repository({
            model: new Model(),
            journal: highlander.fileJournal({
                path: path.resolve(cfg.get('appdata_path'), 'repo/.journal')
            })
        });

        repository.registerCommand('addFile', function (ctx, cb) {
            return cb(null, ctx.model.addFile(ctx.args));
        });

        cfg.set('repo', repository);
    };
})(module);