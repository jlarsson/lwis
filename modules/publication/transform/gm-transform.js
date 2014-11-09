(function (module) {
    'use strict';

    var gm = require('gm');
    var classBuilder = require('ryoc');
    var AbstractTransform = require('./abstract-transform');
    var _ = require('lodash');

    var excluded_gm_methods = {
        'strip': 'image magick only'
    };

    var supported_gm_manipulation_methods = ['adjoin', 'affine', 'antialias', 'append',
         'authenticate', 'autoOrient', 'average', 'backdrop',
         'bitdepth', 'blackThreshold', 'bluePrimary', 'blur',
         'border', 'borderColor', 'box', 'channel', 'charcoal',
         'chop', 'clip', 'coalesce', 'colors',
         'colorize', 'colorMap', 'colorspace', 'comment',
         'compose', 'compress', 'contrast', 'convolve',
         'createDirectories', 'crop', 'cycle', 'deconstruct',
         'delay', 'define', 'density', 'despeckle',
         'dither', 'displace', 'display', 'dispose',
         'dissolve', 'edge', 'emboss', 'encoding',
         'enhance', 'endian', 'equalize', 'extent',
         'file', 'filter', 'flatten', 'flip',
         'flop', 'foreground', 'frame', 'fuzz',
         'gamma', 'gaussian', 'geometry', 'gravity',
         'greenPrimary', 'highlightColor', 'highlightStyle', 'iconGeometry',
         'implode', 'intent', 'interlace', 'label',
         'lat', 'level', 'list', 'limit', 'log',
         'loop', 'lower', 'magnify', 'map', 'matte',
         'matteColor', 'mask', 'maximumError', 'median',
         'minify', 'mode', 'modulate', 'monitor', 'monochrome',
         'morph', 'mosaic', 'motionBlur', 'name', 'negative',
         'noise', 'noop', 'normalize', 'noProfile',
         'opaque', 'operator', 'orderedDither', 'outputDirectory',
         'paint', 'page', 'pause', 'pen',
         'ping', 'pointSize', 'preview', 'process',
         'profile', 'progress', 'quality', 'raise',
         'rawSize', 'randomThreshold', 'recolor', 'redPrimary',
         'region', 'remote', 'render', 'repage',
         'resample', 'resize', 'roll', 'rotate',
         'sample', 'samplingFactor', 'scale', 'scene',
         'scenes', 'screen', 'segment', 'sepia',
         'set', 'setFormat', 'shade', 'shadow',
         'sharedMemory', 'sharpen', 'shave', 'shear',
         'silent', 'solarize', 'snaps', 'stegano',
         'stereo', 'strip', 'spread', 'swirl',
         'textFont', 'texture', 'threshold', 'thumb',
         'tile', 'transform', 'transparent', 'treeDepth',
         'trim', 'type', 'update', 'units', 'unsharp',
         'usePixmap', 'view', 'virtualPixel', 'visual',
         'watermark', 'wave', 'whitePoint', 'whiteThreshold',
         'window', 'windowGroup'];

    var supported_gm_drawing_primitives = ['draw', 'drawArc', 'drawBezier', 'drawCircle',
         'drawEllipse', 'drawLine', 'drawPoint', 'drawPolygon',
         'drawPolyline', 'drawRectangle', 'drawText', 'fill',
         'font', 'fontSize', 'stroke', 'strokeWidth',
         'setDraw'];


    var transformMappings = {
        'jpg': {
            mt: 'image/jpg',
            ext: 'jpg'
        },
        'image/jpg': {
            mt: 'image/jpg',
            ext: 'jpg'
        },
        'jpeg': {
            mt: 'image/jpeg',
            ext: 'jpeg'
        },
        'image/jpeg': {
            mt: 'image/jpg',
            ext: 'jpg'
        },
        'png': {
            mt: 'image/png',
            ext: 'png'
        },
        'image/png': {
            mt: 'image/png',
            ext: 'png'
        },
    };

    var GmTransform = classBuilder()
        .inherit(AbstractTransform)
        .construct(function (format) {
            this.__chain = [];
            this.__format = format !== undefined ? transformMappings[format] || transformMappings['jpg'] : undefined;
        })
        .method('__internal_get_signature', function () {
            var signature = _(this.__chain).map(function (entry) {
                    return [entry.name, '(',
                            _.map(entry.args, function (a) {
                            return JSON.stringify(a || null);
                        }).join(',')
                            , ')'].join('');
                })
                .value()
                .join('.');
            if (this.__format) {
                signature += '+' + this.__format.ext;
            }
            return signature;
        })
        .method('__internal_apply_transform', function (context, callback) {
            var chain = this.__chain;

            var sourceBlob = context.sourceBlob;
            var destBlob = context.destBlob;

            var gmobj = gm(sourceBlob.path);
            for (var i = 0; i < chain.length; ++i) {
                var entry = chain[i];
                gmobj = gmobj[entry.name].apply(gmobj, entry.args);
            }

            if (this.__format) {
                destBlob.headers.mimetype = this.__format.mt;
                gmobj = gmobj.setFormat(this.__format.ext);
            }

            gmobj.write(destBlob.path, callback);
        });


    function createMethod(name) {
        return function () {
            this.__chain.push({
                name: name,
                args: Array.prototype.slice.call(arguments, 0)
            });
            return this;
        }
    }
    var gm_methods = [].concat(supported_gm_manipulation_methods).concat(supported_gm_drawing_primitives);
    for (var i = 0; i < gm_methods.length; ++i) {
        var method = gm_methods[i];
        if (excluded_gm_methods.hasOwnProperty(method)) {
            continue;
        }
        GmTransform.method(method, createMethod(method));
    }

    module.exports = GmTransform.toClass();

})(module);