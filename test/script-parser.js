var assert = require('assert');
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

describe('scriptparser sandboxing', function (){
    it('Cannot affect prototypes', function (){
        parser('Object.prototype.foo = function () {return 1;};');
        (Object.prototype.foo === undefined).should.be.true;
    });
});