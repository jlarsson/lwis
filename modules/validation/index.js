(function (module) {
    'use strict';

    var classBuilder = require('ryoc');

    function notEmpty(message) {
        return function (field, value){
            return /^(\s*)$/i.test(value) ? message || 'The field ' + field + ' must not be empty': null;
        }
    }

    var Klass = classBuilder()
        .construct(function () {
            this.validators = [];
        })
        .method('validate', function (data) {
            var validation = null;
            for (var i = 0; i < this.validators.length; ++i) {
                var v = this.validators[i];

                // Skip if already failed for this field
                if (validation && validation.hasOwnProperty(v.field)) {
                    continue;
                }

                var result = v.validator(v.field, data[v.field]);
                if (result) {
                    (validation || (validation = {}))[v.field] = result;
                }
            }
            return validation;
        })
        .method('use', function (field, validator) {
            this.validators.push({
                field: field,
                validator: validator
            });
            return this;
        })
        .method('notEmpty', function (field, message) {
            return this.use(field, notEmpty(message))
        })
        .toClass();

    module.exports = Klass;

})(module);