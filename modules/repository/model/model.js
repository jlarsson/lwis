(function(module) {
  'use strict';

  var classBuilder = require('ryoc');
  var Files = require('./files');
  var Annotations = require('./annotations');
  var Publications = require('./publications');

  var Model = classBuilder()
    .construct(function() {
      this.annotations = Annotations();
      this.files = Files(this.annotations);
      this.publications = Publications();
    })
    // File api
    .method('addFile', function(file) {
      return this.files.add(file);
    })
    .method('getFile', function(id) {
      return this.files.get(id);
    })
    .method('getFiles', function() {
      return this.files.getAll();
    })
    .method('annotateFile', function(fileId, annotationId, value) {
      return this.annotations.annotateFile(annotationId, this.files.get(fileId), value)
    })
    // Annotations (i.e. managed properties on files)
    .method('addAnnotation', function(annotation) {
      return this.annotations.add(annotation);
    })
    .method('getAnnotation', function(id) {
      return this.annotations.get(id);
    })
    .method('getAnnotations', function() {
      return this.annotations.getAll();
    })
    // Publications, i.e transformating routes
    .method('addPublication', function(publication) {
      return this.publications.add(publication);
    })
    .method('getPublication', function(id) {
      return this.publications.get(id);
    })
    .method('getPublications', function() {
      return this.publications.getAll();
    })
    .toClass();

  module.exports = Model;

})(module);
