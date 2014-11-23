(function(module) {
  'use strict';
  var routeHelper = require('../shared/route-helper')(__dirname);
  var uuid = require('uuid');
  var _ = require('lodash');

  module.exports = function(app, options) {
    var base = '/lwis/annotation';

    function mkrel(l) {
      return base + '/' + l;
    }

    var annotationValidator = app.get('annotation-validator');

    routeHelper.useRoute(app, base)
      .get('/', routeHelper.html('./views/index.marko', getIndexModel))
      .get('/new', routeHelper.html('./views/edit.marko', getNewModel))
      .get('/edit/:id', routeHelper.html('./views/edit.marko', getEditModel))
      .post('/edit/:id', onEdited);

    function getTypeOptions(selected) {
      return _.map([{
        name: 'String',
        value: 'string'
      }, {
        name: 'Number',
        value: 'number'
      }, {
        name: 'Bool (flag)',
        value: 'bool'
      }, {
        name: 'Text (multiline string)',
        value: 'text'
      }, {
        name: 'Date and time',
        value: 'date'
      }], function(r) {
        r.selected = r.value === selected;
        return r;
      });
    }

    function getTypeValues(annotation) {
      var values = {
        string_value: '',
        number_value: 0,
        bool_value: false,
        text_value: '',
        date_value: ''
      };
      values[annotation.type + '_value'] = annotation.value;
      return values;
    }

    function getPostedValue(req){
      console.log('%j', req.body);
      var type = req.body.type;
      var v = req.body[type + '_value'];
      switch (type){
        case 'bool': v = (v ? true : false); break;
        case 'number': var v = Number(v); v = isNaN(v) ? 0 : v.valueOf(); break;
      }
      console.log('%s -> %s', type, v);
      return v;
    }

    function getIndexModel(req, cb) {
      app.get('repo').query(function(model, cb) {
          return cb(null, model.getAnnotations());
        },
        function(err, annotations) {
          cb(null, {
            title: 'Annotations',
            annotations: annotations,
            mkrel: mkrel
          });
        });
    }

    function getNewModel() {
      return {
        title: 'New annotation',
        annotation: {
          name: ''
        },
        typeOptions: getTypeOptions('string'),
        typeValues: getTypeValues({}),
        errors: {},
        mkrel: mkrel,
        postLink: mkrel('edit/' + uuid.v4())
      }
    }

    function getEditModel(req, res, next, cb) {
      var id = req.params.id;
      app.get('repo').query(function(model, cb) {
          return cb(null, model.getAnnotation(id));
        },
        function(err, annotation) {
          if (!annotation) {
            return next();
          }
          cb(null, {
            title: annotation.name,
            annotation: annotation,
            typeOptions: getTypeOptions(annotation.type),
            typeValues: getTypeValues(annotation),
            errors: {},
            mkrel: mkrel
          });
        });
    }

    function onEdited(req, res, next) {
      var annotation = {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        value: getPostedValue(req)
      };
      var errors = annotationValidator.validate(annotation);
      if (errors) {
        return res.json(errors);
      }

      app.get('repo').execute('set-annotation', annotation,
        function(err, annotation) {
          if (err) {
            return res.json({
              general: err.message
            });
          }
          if (!annotation) {
            return next(err);
          }
          return res.json({});
        });
    }
  };
})(module);
