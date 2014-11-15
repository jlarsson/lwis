(function(module) {
  'use strict';

  var uuid = require('uuid');
  var importer = require('./importer');

  var routeHelper = require('../shared/route-helper')(__dirname);

  module.exports = function configureUploadRoutes(app, options) {
    var base = '/lwis/upload';

    function mkrel(l) {
      return base + '/' + l;
    }

    routeHelper.useRoute(app, base)
      .get('/', routeHelper.html('./views/index.marko', getIndexModel))
      // allocate new upload session
      .get('/newbatch', function(req, res) {
        res.json({
          url: mkrel('addtobatch/' + uuid.v4().split('-').join(''))
        });
      })
      .post('/addtobatch/:batchid', addToBatch);

    function getIndexModel(req, cb) {
      return cb(null, {
        title: 'Upload',
        mkrel: mkrel
      });
    }

    function addToBatch(req, res) {
      var hasFile = false;

      function done(err) {
        res.json(err ? {
          message: err
        } : {});
      };
      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if (hasFile) {
          return;
        }
        hasFile = true;
        importer.import(app, {
          batchid: req.params.batchid,
          file: file,
          filename: filename,
          mimetype: mimetype
        }, done);
      });
      req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {});
      req.busboy.on('finish', function() {
        if (!hasFile) {
          done();
        }
      });

      req.pipe(req.busboy);

    }
  };
})(module);
