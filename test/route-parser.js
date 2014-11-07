var assert = require('assert');
var parser = require('../modules/publication/route-parser');

describe('routeparser', function () {
    function bad(route){
        var p = parser(route);
        p.valid.should.equal(false, p.errorMessage);
    }
    function ok(route){
        var p = parser(route);
        p.valid.should.equal(true, p.errorMessage);
    }
    
    it('parses parameterless route', function (){
        ok('/some/path');
        ok('/some/path/')
    });
    it('rejects bad parameter names', function (){
        bad('/some/:/path');
        bad('/some/:{path/');
    });
    it('rejects reserved parameter names', function (){
        bad('/some/:this');
        bad('/some/:function');
        bad('/some/:false');
        bad('/some/:true');
    });
    it('rejects future reserved parameter names', function (){
        bad('/some/:abstract');
        bad('/some/:class');
    });
    it('rejects duplicate names', function (){
        bad('/some/:a/:a');
    });
    it('reports parameter names', function (){
        var p = parser('/when/:path/then/:show');
        p.valid.should.equal(true);
        p.params.should.eql(['path','show']);
    });
    
    it('reject root route', function (){
        bad('/');
    });
    
    
    it('fails on non-string arguments', function (){
        bad();
        bad(['abc']);
        bad({a: 'abc'});
    });
});
