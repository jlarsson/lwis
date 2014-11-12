var should = require('should');
var parser = require('../modules/scripting/mapreduce-parser');

describe('scriptparser', function() {
  function ok(scriptCode, parameterNames) {

    var parsing = parser(scriptCode);

    (!!parsing.error).should.equal(false);
    parsing.valid.should.equal(true);
    return parsing;
  };

  it('happy path', function() {

    var p = ok('function map(v){emit(v+1);}function reduce(list){return list;}');
    var script = p.createScript();

    var r = script.mapReduce([1, 2, 3, 4]);

    [2, 3, 4, 5].should.eql(r);
  });
})
