(function (module) {
    'use strict';

    var ryoc = require('ryoc');
    var Bro = require('brototype');

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
        .toClass();

    var LiteralExpression = ryoc()
        .inherit(Expression)
        .construct(function (value) {
            this.value = value;
        })
        .method('evaluate', function (context) {
            return this.value;
        })
        .toClass();

    var FieldExpression = ryoc()
        .inherit(Expression)
        .construct(function (field) {
            this.field = field;
        })
        .method('evaluate', function (context) {
            return Bro(context.currentFile).iCanHaz(this.value);
        })
        .toClass();

    var ParamExpression = ryoc()
        .inherit(Expression)
        .construct(function (name) {
            this.param = name;
        })
        .method('evaluate', function (context) {
            return this.req.params[this.name];
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
        .toClass();

    module.exports = {
        LiteralExpression: LiteralExpression,
        FieldExpression: FieldExpression,
        ParamExpression: ParamExpression,
        BinaryOperatorExpression: BinaryOperatorExpression,
        UnaryOperatorExpression: UnaryOperatorExpression
    };
})(module);