var assert = require('assert');
var should = require('should');
var modelFactory = require('./../modules/repository/model/model');

describe('Model', function() {

  describe('Annotations', function() {
    var model;
    beforeEach(function() {
      model = modelFactory();
    });

    it('annotations are applied to new files', function() {
      model.setAnnotation({
        id: 'a1',
        name: 's',
        type: 'string',
        value: 'sv'
      });
      model.setFile({
        id: 'f'
      });

      model.getFile('f').ext.s.should.equal('sv');
    });

    it('annotations are applied to existing files', function() {
      model.setFile({
        id: 'f'
      });
      (undefined === model.getFile('f').ext.s).should.equal(true);

      model.setAnnotation({
        id: 'a1',
        name: 's',
        type: 'string',
        value: 'sv'
      });

      model.getFile('f').ext.s.should.equal('sv');
    })

    it('changing default value is applied to all (untouched) files', function() {
      model.setFile({
        id: 'f'
      });
      model.setFile({
        id: 'fmod'
      });

      model.setAnnotation({
        id: 'a1',
        name: 's',
        type: 'string',
        value: 'first'
      });
      model.getFile('f').ext.s.should.equal('first');
      model.getFile('fmod').ext.s.should.equal('first');

      model.annotateFile('fmod', 'a1', 'modified');

      model.getFile('fmod').ext.s.should.equal('modified');

      model.setAnnotation({
        id: 'a1',
        name: 's',
        type: 'string',
        value: 'second'
      });
      model.getFile('f').ext.s.should.equal('second');
      model.getFile('fmod').ext.s.should.equal('modified');
    })

    it('annotations can be renamed', function() {
      model.setAnnotation({
        id: 'a1',
        name: 's',
        type: 'string',
        value: 'sv'
      });
      model.setFile({
        id: 'f'
      });
      model.getFile('f').ext.s.should.equal('sv', 'Initial name ext.s');

      model.setAnnotation({
        id: 'a1',
        name: 's2',
        type: 'string',
        value: 'sv'
      });
      model.getFile('f').ext.s2.should.equal('sv', 'Renamed to ext.s2');
    });
  });

  describe("Files", function() {
    var model;
    beforeEach(function() {
      model = modelFactory();
    });

    it('can be added', function() {
      model.setFile({
        id: 'f'
      }).id.should.equal('f');
    })
    it('can be retrieved', function() {
      model.setFile({
        id: 'f'
      });
      model.getFile('f').id.should.equal('f');
    })

    it('can be added', function() {
      model.setFile({
        id: 'f'
      }).id.should.equal('f');
    })
    it('overwites existing', function() {
      model.setFile({
        id: 'f',
        a: 0
      });
      model.setFile({
        id: 'f',
        a: 1
      });
      model.getFile('f').a.should.equal(1);
    })
  });

/*
  describe('stress', function() {
    var model;
    beforeEach(function() {
      model = modelFactory();
    });

    it('define annotation, add lots of files and the change default for annotation', function() {
      model.setAnnotation({
        id: 'a',
        name: 'a',
        type: 'bool',
        value: false
      });

      var N = 100000;
      for (var i = 0; i < 100; ++i) {
        model.setFile({
          id: 'f' + i,
          name: 'file ' + i
        });
      }
      var files = model.getFiles();
      for (var i = 0; i < files.length; ++i) {
        var f = files[i];
        f.ext.a.should.equal(false);
      }

      model.setAnnotation({
        id: 'a',
        name: 'a',
        type: 'bool',
        value: true
      });
      files = model.getFiles();
      for (var i = 0; i < files.length; ++i) {
        var f = files[i];
        f.ext.a.should.equal(true);
      }
    })
  });
*/
});
