(function (module) {
    'use strict';

    var ryoc = require('ryoc');
    var Bro = require('brototype').Bro;
    var _ = require('lodash');

    var Functions = {
        len: function (v) { return v ? String(v).length : 0 },
        toString: function (v) { return String(v); },
        toUpper: function (v) { return String(v).toUpperCase(); },
        toLower: function (v) { return String(v).toLowerCase(); },
        contains: function (source, test) { return (source && test) && String(source).toLowerCase().indexOf(String(test).toLowerCase()) >= 0; }
    }
    var BinaryOperations = {
        '*': function (l, r, c) {
            return l.evaluate(c) * r.evaluate(c)
        },
        '/': function (l, r, c) {
            return l.evaluate(c) / r.evaluate(c)
        },
        '%': function (l, r, c) {
            return l.evaluate(c) % r.evaluate(c)
        },
        '+': function (l, r, c) {
            return l.evaluate(c) + r.evaluate(c)
        },
        '-': function (l, r, c) {
            return l.evaluate(c) - r.evaluate(c)
        },
        '<<': function (l, r, c) {
            return l.evaluate(c) << r.evaluate(c)
        },
        '>>>': function (l, r, c) {
            return l.evaluate(c) >>> r.evaluate(c)
        },
        '>>': function (l, r, c) {
            return l.evaluate(c) >> r.evaluate(c)
        },
        '<=': function (l, r, c) {
            return l.evaluate(c) <= r.evaluate(c)
        },
        '>=': function (l, r, c) {
            return l.evaluate(c) >= r.evaluate(c)
        },
        '<': function (l, r, c) {
            return l.evaluate(c) < r.evaluate(c)
        },
        '>': function (l, r, c) {
            return l.evaluate(c) > r.evaluate(c)
        },
        '===': function (l, r, c) {
            return l.evaluate(c) === r.evaluate(c)
        },
        '!==': function (l, r, c) {
            return l.evaluate(c) !== r.evaluate(c)
        },
        '==': function (l, r, c) {
            return l.evaluate(c) == r.evaluate(c)
        },
        '!=': function (l, r, c) {
            return l.evaluate(c) != r.evaluate(c)
        },
        '&': function (l, r, c) {
            return l.evaluate(c) & r.evaluate(c)
        },
        '^': function (l, r, c) {
            return l.evaluate(c) ^ r.evaluate(c)
        },
        '|': function (l, r, c) {
            return l.evaluate(c) | r.evaluate(c)
        },
        '&&': function (l, r, c) {
            return l.evaluate(c) && r.evaluate(c)
        },
        '||': function (l, r, c) {
            return l.evaluate(c) || r.evaluate(c)
        }
    };
    var UnaryOperations = {
        '+': function (e, c) {
            return +e.evaluate(c)
        },
        '-': function (e, c) {
            return -e.evaluate(c)
        },
        '~': function (e, c) {
            return~ e.evaluate(c)
        },
        '!': function (e, c) {
            return !e.evaluate(c)
        }
    };

    var Expression = ryoc()
        .abstract('evaluate', function (context) {})
        .abstract('describe', function (context) {})
        .toClass();

    var IdentifierExpression = ryoc()
        .inherit(Expression)
        .construct(function (identifier) {
            this.identifier = identifier;
        })
        .method('evaluate', function (context) {
            return this.identifier;
        })
        .method('describe', function () {
            return '@' + this.identifier;
        })
        .toClass();

    var LiteralExpression = ryoc()
        .inherit(Expression)
        .construct(function (value) {
            this.value = value;
        })
        .method('evaluate', function (context) {
            return this.value;
        })
        .method('describe', function () {
            return this.value;
        })
        .toClass();

    var FieldExpression = ryoc()
        .inherit(Expression)
        .construct(function (field) {
            this.field = field;
        })
        .method('evaluate', function (context) {
            return Bro(context.current).iCanHaz(this.field);
        })
        .method('describe', function () {
            return '{' + this.field + '}';
        })
        .toClass();

    var ParamExpression = ryoc()
        .inherit(Expression)
        .construct(function (param) {
            this.param = param;
        })
        .method('evaluate', function (context) {
            return context.req.params[this.param];
        })
        .method('describe', function () {
            return ':' + this.param;
        })
        .toClass();


    var BinaryOperatorExpression = ryoc()
        .inherit(Expression)
        .construct(function (operator, lhs, rhs) {
            this.operator = operator;
            this.lhs = lhs;
            this.rhs = rhs;
            this.operation = BinaryOperations[operator];
        })
        .method('evaluate', function (context) {
            return this.operation(this.lhs, this.rhs, context);
        })
        .method('describe', function () {
            return ['(', this.lhs.describe(), this.operator, this.rhs.describe(), ')'].join('');
        })
        .toClass();

    var UnaryOperatorExpression = ryoc()
        .inherit(Expression)
        .construct(function (operator, expression) {
            this.operator = operator;
            this.expression = expression;
            this.operation = UnaryOperations[operator]
        })
        .method('evaluate', function (context) {
            return this.operation(this.expression, context);
        })
        .method('describe', function () {
            return ['(', this.operator, this.value, ')'].join('');
        })
        .toClass();

    var CallExpression = ryoc()
        .inherit(Expression)
        .construct(function (fn, args) {
            this.fn = fn;
            this.args = args;
        })
        .method('evaluate', function (context) {
            var fun = Functions[this.fn.evaluate(context)];
            var args = _.map(this.args, function (a){ return a.evaluate(context); });
            var result = fun.apply(null, args);
            return result;
        })
        .method('describe', function () {
            return [
                this.fn, '(',
                _(this.args).map(function (a) {
                    return a.describe();
                }).value().join(','),
                ')'].join('');
        })
        .toClass();

    module.exports = {
        IdentifierExpression: IdentifierExpression,
        LiteralExpression: LiteralExpression,
        FieldExpression: FieldExpression,
        ParamExpression: ParamExpression,
        BinaryOperatorExpression: BinaryOperatorExpression,
        UnaryOperatorExpression: UnaryOperatorExpression,
        CallExpression: CallExpression
    };
})(module);