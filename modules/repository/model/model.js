(function(module) {
  'use strict';

  var classBuilder = require('ryoc');
  var Files = require('./files');
  var Annotations = require('./annotations');
  var Publications = require('./publications');

  var Model = classBuilder()
    .construct(function() {
      this.files = Files();
      this.annotations = Annotations(this.files);
      this.publications = Publications();
    })
    // File api
    .method('setFile', function(file) {
      return this.files.set(file);
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
    .method('setAnnotation', function(annotation) {
      return this.annotations.set(annotation);
    })
    .method('getAnnotation', function(id) {
      return this.annotations.get(id);
    })
    .method('getAnnotations', function() {
      return this.annotations.getAll();
    })
    // Publications, i.e transformating routes
    .method('setPublication', function(publication) {
      return this.publications.set(publication);
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
