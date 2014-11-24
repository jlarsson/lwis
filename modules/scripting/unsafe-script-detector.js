(function(module) {
  'use strict';
  var esprima = require('esprima');

  var validators = {
    'ForStatement': function() {
      throw new Error('Illegal for statement. Consider using forEach(array, function (item,index){...}) or forEach(object, function (value,key){...}) instead.');
    },
    'ForInStatement': function() {
      throw new Error('Illegal for-in statement. Consider using forEach(array, function (item,index){...}}) or forEach(object, function (value,key){...}) instead.');
    },
    'WhileStatement': function() {
      throw new Error('Illegal while statement');
    },
    'ThrowStatement': function() {
      throw new Error('Illegal throw statement');
    },
    'CallExpression': function(n) {
      if (n.callee.name == 'eval') {
        throw new Error('Illegal use of eval()');
      }
    }
  };

  function validate(scriptCode) {
    var ast = esprima.parse(scriptCode || {});

    traverse(ast, function(node) {
      (validators[node.type] || (function() {}))(node);
    });
  }

  function traverse(node, func) {
    func(node);
    for (var key in node) {
      if (node.hasOwnProperty(key)) {
        var child = node[key];
        if (typeof child === 'object' && child !== null) {

          if (Array.isArray(child)) {
            child.forEach(function(node) {
              traverse(node, func);
            });
          } else {
            traverse(child, func);
          }
        }
      }
    }
  }

  module.exports = validate;

})(module);
