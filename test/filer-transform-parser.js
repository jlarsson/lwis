require('should');
var assert = require('assert');
var parser = require('../modules/transform/filter-transform-parser');

describe('ft-parser', function (){
    it('should throw on invalid js syntax', function (){
        assert.throws(function (){ parser(')'); }, SyntaxError);
    });
    
    it('should detect filter() function', function (){
        var p = parser('function filter(){}');
        assert(p.hasFilter);

        var p = parser('function nofilter(){}');
        assert(!p.hasFilter);
    });
    
    it('should detect transform() function', function (){
        var p = parser('function transform(){}');
        assert(p.hasTransform);

        var p = parser('function notransform(){}');
        assert(!p.hasTransform);
    });
    
    it('can filter with missing filter()', function (){
        var p = parser('var x = 1;')
        
        assert(undefined === p.filter([1,2,3]));
    });
    
    it('can filter', function (){   
        var list = [1,2,3,4];
        var p = parser('function filter(){ return this > 2; }')
        var filtered = p.filter(list);
        filtered.should.eql([3,4]);
    });
    
    it('can transform with missing filter()', function (){
        var p = parser('var x = 1;')
        
        assert(undefined === p.transform());
    });

    it('can transform', function (){
        var p = parser('function transform(){ return this.x; }')
        
        p.transform({x: 'gotcha'}).should.equal('gotcha');
    });
    
});