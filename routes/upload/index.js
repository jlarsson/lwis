(function (module) {
    'use strict';

    var express = require('express');
    var Router = express.Router;
    var async = require('async');
    var fs = require('fs');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var uuid = require('uuid');
    var debug = require('debug')('lwis:upload');
    var blobstore = require('blobstore');

    function addFileToBatch(app, data, callback) {

        // Create temporary file and pipe posted file to it
        var tempPath = path.resolve(app.get('temp'), uuid.v4());
        var tempStream = fs.createWriteStream(tempPath);

        var fileData = {
            id: uuid.v4(),
            mimetype: data.mimetype,
            created: new Date(),
            batch: {
                id: data.batchid
            },
            file: {
                name: data.filename,
                size: 0
            },
            blob: {
                key: null,
                hash: null
            }
        };

        function mkcb1(cb) {
            return function (err) {
                cb(err);
            }
        }

        function cleanup() {
            tempStream.close();
            fs.unlink(tempPath, function () {});
        }
        async.seq(
            function ensureTempFolder(x, cb) {
                var folder = path.dirname(tempPath);
                mkdirp(folder, cb);
            },
            function pipeToTemp(x, cb) {
                debug('pipeToTemp');
                data.file.pipe(tempStream)
                    .on('error', mkcb1(cb))
                    .on('finish', mkcb1(cb));
            },
            function getTempStats(cb) {
                debug('getTempStats: %s', tempPath);
                fs.stat(tempPath, cb);
            },
            function onGetStats(stats, cb) {
                debug('onGetStats');
                fileData.file.size = stats.size;
                cb(null);
            },
            function extractMetadata(cb) {
                app.get('metadata-extractor')({
                        path: tempPath,
                        metadata: fileData
                    },
                    cb);
            },
            function addBlob(cb) {
                debug('addBlob');
                var blob = blobstore.createBlob(tempPath);
                app.get('blobstore').addBlob(blob, cb);
            },
            function onBlobAdded(blob, cb) {
                debug('onBlobAdded');
                fileData.blob.key = blob.key;
                blob.getHash(cb);
            },
            function onHash(hash, cb) {
                debug('onHash');
                fileData.blob.hash = hash;
                cb(null);
            },
            function addFileToRepo(cb) {
                debug('addFileToRepo');
                app.get('repo').execute('add-file', fileData, mkcb1(cb));
            },
            function onFilAddedToRepo(cb) {
                debug('onFileAdded');
                cb(null);
            })(0, function (err) {
            debug('done');
            cleanup();
            callback();
        });
    }


    module.exports = function (app, options) {

        var router = Router();
        router.get('/index', function (req, res) {
            res.render('upload/index', {
                title: 'Upload files'
            });
        });

        // allocate new upload session
        router.get('/newbatch', function (req, res) {
            res.json({
                url: 'addtobatch/' + uuid.v4().split('-').join('')
            });
        });

        router.post('/addtobatch/:batchid', function (req, res) {

            var hasFile = false;

            function done(err) {
                res.json(err ? {
                    message: err
                } : {});
            };
            req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                if (hasFile) {
                    return;
                }
                hasFile = true;
                addFileToBatch(app, {
                    batchid: req.params.batchid,
                    file: file,
                    filename: filename,
                    mimetype: mimetype
                }, done);
            });
            req.busboy.on('field', function (key, value, keyTruncated, valueTruncated) {});
            req.busboy.on('finish', function () {
                if (!hasFile) {
                    done();
                }
            });

            req.pipe(req.busboy);
        });

        app.use(options.base, router);
    };
})(module);