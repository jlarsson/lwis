var assert = require('assert');
var should = require('should');
var modelFactory = require('./../modules/repository/model/model');

describe('Annotations', function() {
  var model;
  beforeEach(function() {
    model = modelFactory();
  });

  it('annotations are applied to new files', function() {
    model.addAnnotation({
      id: 'a1',
      name: 's',
      type: 'string',
      value: 'sv'
    });
    model.addFile({
      id: 'f'
    });

    model.getFile('f').ext.s.should.equal('sv');
  })

  it('annotations are applied to existing files', function() {
    model.addFile({
      id: 'f'
    });
    (undefined === model.getFile('f').ext.s).should.equal(true);

    model.addAnnotation({
      id: 'a1',
      name: 's',
      type: 'string',
      value: 'sv'
    });

    model.getFile('f').ext.s.should.equal('sv');
  })

  it('changing default value is applied to all (untouched) files', function() {
    model.addFile({
      id: 'f'
    });
    model.addFile({
      id: 'fmod'
    });

    model.addAnnotation({
      id: 'a1',
      name: 's',
      type: 'string',
      value: 'first'
    });
    model.getFile('f').ext.s.should.equal('first');
    model.getFile('fmod').ext.s.should.equal('first');

    model.annotateFile('fmod', 'a1', 'modified');

    //console.log('### %j', model.getFile('fmod'));
    model.getFile('fmod').ext.s.should.equal('modified');

    model.addAnnotation({
      id: 'a1',
      name: 's',
      type: 'string',
      value: 'second'
    });
    model.getFile('f').ext.s.should.equal('second');
    model.getFile('fmod').ext.s.should.equal('modified');
  })

  it('annotations can be renamed', function() {
    model.addAnnotation({
      id: 'a1',
      name: 's',
      type: 'string',
      value: 'sv'
    });
    model.addFile({
      id: 'f'
    });
    model.getFile('f').ext.s.should.equal('sv', 'Initial name ext.s');

    model.addAnnotation({
      id: 'a1',
      name: 's2',
      type: 'string',
      value: 'sv'
    });
    model.getFile('f').ext.s2.should.equal('sv', 'Renamed to ext.s2');
  })
})

describe("Files", function() {
  var model;
  beforeEach(function() {
    model = modelFactory();
  });

  it('can be added', function() {
    model.addFile({
      id: 'f'
    }).id.should.equal('f');
  })
  it('can be retrieved', function() {
    model.addFile({
      id: 'f'
    });
    model.getFile('f').id.should.equal('f');
  })

  it('can be added', function() {
    model.addFile({
      id: 'f'
    }).id.should.equal('f');
  })
  it('overwites existing', function() {
    model.addFile({
      id: 'f',
      a: 0
    });
    model.addFile({
      id: 'f',
      a: 1
    });
    model.getFile('f').a.should.equal(1);
  })
});
