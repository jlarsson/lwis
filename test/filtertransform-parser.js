var should = require('should');
var parser = require('../modules/scripting/filtertransform-parser');

describe('scriptparser', function () {
    function ok(scriptCode, parameterNames){
        var parsing = parser(scriptCode, parameterNames);
        (parsing.error === null).should.equal(true);
        return parsing;
    }

    function bad(scriptCode, parameterNames){
        var parsing = parser(scriptCode, parameterNames);
        (parsing.error instanceof Error).should.equal(true);
        return parsing;
    }
    it('detects transform() if is a function', function (){
      ok('function filter(){}');
    });
    it('rejects invalid syntax', function (){
        bad('{');
    });
    it('detects if filter() and transform() are missing', function (){
        bad('return 1;').hasFilter.should.equal(false)
        bad('return 1;').hasTransform.should.equal(false)
    });
    it('detects filter() if is a function', function (){
        ok('function filter(){}').hasFilter.should.equal(true);
    });
    it('rejects filter if not a function', function (){
        bad('var filter = 1;').hasFilter.should.equal(false);
    });

    it('detects transform() if is a function', function (){
        bad('function transform(){}').hasTransform.should.equal(true);
    });

    it('rejects transform if not a function', function (){
        bad('var transform = 1;').hasFilter.should.equal(false);
    });
  describe('script execution', function (){
      it('filter() is applied', function (){
          var script = ok('function filter() { return this > 2; }').createScript({});

          var filtered = script.filter([1,2,3,4]);

          filtered.should.eql([3,4]);
      });

      it('filter() can use parameters', function (){
          var script = ok('function filter() { return this == a; }',['a']).createScript({a:3});

          var filtered = script.filter([1,2,3,4]);

          filtered.should.eql([3]);
      });

      it('transform() is applied', function (){
          var script = bad('function transform(t) { return t(this); }').createScript({});

          var self = {name: 'test'};
          var factory = function (o){o.transformed = true; return o;};
          var transformed = script.transform(self,[factory]);
          (self === transformed).should.equal(true);
          self.transformed.should.equal.true;
      });

      it('transform() can use parameters', function (){
          var script = bad('function transform() { return p1; }',['p1']).createScript({p1:'hello'});
          script.transform({}).should.equal('hello');
      });
      if('filter can use script variables', function (){
        var script = ok('var matching = a + 1; function filter() { return this == matching; }',['a']).createScript({a:2});

        var filtered = script.filter([1,2,3,4]);

        filtered.should.eql([3]);

      });
      if('filter can use own functions', function (){
        var script = ok('function isMatch(v) { return v > a; } function filter() { return isMatch(this); }',['a']).createScript({a:2});

        var filtered = script.filter([1,2,3,4]);

        filtered.should.eql([3,4]);
      });
  });

  describe('scriptparser sandboxing', function (){
      it('Cannot affect prototypes', function (){
          parser('Object.prototype.foo = function () {return 1;};');
          (Object.prototype.foo === undefined).should.be.true;
      });
  });
});
