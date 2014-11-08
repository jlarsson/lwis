var assert = require('assert');
var should = require('should');
var parser = require('../modules/publication/script-parser');

describe('scriptparser', function () {
    function ok(scriptCode){
        var parsing = parser(scriptCode,[]);
        (parsing.error === null).should.equal(true);
        return parsing;
    }
    
    function bad(scriptCode){
        var parsing = parser(scriptCode,[]);
        (parsing.error instanceof Error).should.equal(true);
        return parsing;
    }
    
    it('rejects invalid syntax', function (){
        bad('{');
    });
    
    it('detects if filter() and transform() are missing', function (){
        ok('return 1;').hasFilter.should.equal(false)
        ok('return 1;').hasTransform.should.equal(false)
    });
    
    it('detects filter() if is a function', function (){
        ok('function filter(){}').hasFilter.should.equal(true);
        ok('var filter = function (){}').hasFilter.should.equal(true);
        ok('var filter = function foo(){}').hasFilter.should.equal(true);
    });
    
    it('rejects filter if not a function', function (){
        ok('var filter = 1;').hasFilter.should.equal(false);
    });
    
    it('detects transform() if is a function', function (){
        ok('function transform(){}').hasTransform.should.equal(true);
        ok('var transform = function (){}').hasTransform.should.equal(true);
        ok('var transform = function foo(){}').hasTransform.should.equal(true);
    });
    
    it('rejects transform if not a function', function (){
        ok('var transform = 1;').hasFilter.should.equal(false);
    });
});

describe('script execution', function (){
    function ok(scriptCode, parameterNames){
        var parsing = parser(scriptCode,parameterNames||[]);
        (parsing.error === null).should.equal(true);
        return parsing;
    }
    
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
        var script = ok('function transform(t) { return t(this); }').createScript({});
        
        var self = {name: 'test'};
        var factory = function (o){o.transformed = true; return o;};
        var transformed = script.transform(self,[factory]);
        (self === transformed).should.equal(true);
        self.transformed.should.equal.true;
    });
    
    it('transform() can use parameters', function (){
        var script = ok('function transform() { return p1; }',['p1']).createScript({p1:'hello'});
        script.transform({}).should.equal('hello');
    });
    
});

describe('scriptparser sandboxing', function (){
    it('Cannot affect prototypes', function (){
        parser('Object.prototype.foo = function () {return 1;};');
        (Object.prototype.foo === undefined).should.be.true;
    });
});