(function(module) {
  'use strict';

  var express = require('express');
  var routeHelper = require('../shared/route-helper')(__dirname);

  var debug = require('debug')('lwis:repository');
  var filesize = require('filesize');

  module.exports = function(app, options) {

    routeHelper.useRoute(app, '/lwis/repository')
      .get('/', function(req, res) {
        return res.redirect('./index/0');
      })
      .get('/index', function(req, res) {
        return res.redirect('./index/0');
      })
      .get('/index/:pageIndex?', routeHelper.html('./views/index.marko', getIndexModel))
      .get('/details/:id', routeHelper.html('./views/details.marko', getDetailsModel));

    function getIndexModel(req, cb) {
      req.app.get('repo').query(function(model, cb) {
          return cb(null, model.getFiles());
        },
        function(err, files) {
          var pageSize = 20;
          var pageIndex = Number(req.params.pageIndex) || 0;
          if (pageIndex * pageSize >= files.length) {
            pageIndex = 0;
          }

          var pageCount = Math.floor((files.length + pageSize - 1) / pageSize);

          var startIndex = pageIndex * pageSize;
          var slice = files.slice(startIndex, startIndex + pageSize);
          var model = {
            title: 'Repository',
            files: slice,
            fileCount: files.length,
            pageIndex: pageIndex,
            pageSize: pageSize,
            pageCount: pageCount,
            formatSize: filesize,
            formatPageIndexRange: function(n) {
              var first = pageIndex - n;
              if (first < 0) {
                first = 0;
              }
              var last = first + 2*n + 1;
              if (last > pageCount) {
                last = pageCount;
                first = last - n * 2 - 1;
                if (first < 0) {
                  first = 0;
                }
              }
              var next = last + n;
              if (next > pageCount-1) {
                next = pageCount-1;
              };
              var prev = first - n - 1;

              return  {
                first: first,
                last: last,
                prev: prev,
                next: next
              };
            }

          };
          return cb(err, model);



          var f = [];
          for (var i = 0; i < 100; ++i) {
            f = f.concat(files);
          }
          files = f;

          var pageSize = 10;
          var currentPage = 0;
          var currentIndex = 0;
          // Mark pages...
          while (currentIndex < files.length) {
            files[currentIndex].paging = {
              index: currentPage
            };
            currentIndex += pageSize;
            currentPage = currentPage + 1;
          }
          return cb(err, {
            title: 'Repository',
            files: files,
            formatSize: filesize,
            pageSize: pageSize,
            pageCount: currentPage
          });
        });
    }

    function getDetailsModel(req, cb) {
      req.app.get('repo').query(function(model, cb) {
          cb(null, model.getFile(req.params.id));
        },
        function(err, file) {
          return cb(err, {
            title: file.name,
            file: file,
            formatSize: filesize
          });
        });
    };
  };
})(module);
