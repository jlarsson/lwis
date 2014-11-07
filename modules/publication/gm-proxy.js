(function (module){
    'use strict';
    
    var classBuilder = require('ryoc');
    var _ = require('lodash');
    
    var excluded_gm_methods = {'strip': 'image magick only'};
    
    var supported_gm_manipulation_methods =     
        ['adjoin','affine','antialias','append',
         'authenticate','autoOrient','average','backdrop',
         'bitdepth','blackThreshold','bluePrimary','blur',
         'border','borderColor','box','channel','charcoal',
         'chop','clip','coalesce','colors',
         'colorize','colorMap','colorspace','comment',
         'compose','compress','contrast','convolve',
         'createDirectories','crop','cycle','deconstruct',
         'delay','define','density','despeckle',
         'dither','displace','display','dispose',
         'dissolve','edge','emboss','encoding',
         'enhance','endian','equalize','extent',
         'file','filter','flatten','flip',
         'flop','foreground','frame','fuzz',
         'gamma','gaussian','geometry','gravity',
         'greenPrimary','highlightColor','highlightStyle','iconGeometry',
         'implode','intent','interlace','label',
         'lat','level','list','limit','log',
         'loop','lower','magnify','map','matte',
         'matteColor','mask','maximumError','median',
         'minify','mode','modulate','monitor','monochrome',
         'morph','mosaic','motionBlur','name','negative',
         'noise','noop','normalize','noProfile',
         'opaque','operator','orderedDither','outputDirectory',
         'paint','page','pause','pen',
         'ping','pointSize','preview','process',
         'profile','progress','quality','raise',
         'rawSize','randomThreshold','recolor','redPrimary',
         'region','remote','render','repage',
         'resample','resize','roll','rotate',
         'sample','samplingFactor','scale','scene',
         'scenes','screen','segment','sepia',
         'set','setFormat','shade','shadow',
         'sharedMemory','sharpen','shave','shear',
         'silent','solarize','snaps','stegano',
         'stereo','strip','spread','swirl',
         'textFont','texture','threshold','thumb',
         'tile','transform','transparent','treeDepth',
         'trim','type','update','units','unsharp',
         'usePixmap','view','virtualPixel','visual',
         'watermark','wave','whitePoint','whiteThreshold',
         'window','windowGroup'];
    
    var supported_gm_drawing_primitives  = 
        ['draw','drawArc','drawBezier','drawCircle',
         'drawEllipse','drawLine','drawPoint','drawPolygon',
         'drawPolyline','drawRectangle','drawText','fill',
         'font','fontSize','stroke','strokeWidth',
         'setDraw'];
    
    
    var Proxy = classBuilder()
        .construct(function (transformationHandle){
            var chain = this.__chain = [];

            transformationHandle.needApply = function () { return chain.length > 0; };
            transformationHandle.apply = function (gm){
                for (var i = 0; i < chain.length; ++i)
                {
                    var entry = chain[i];
                    gm = gm[entry.name].apply(gm, entry.args);
                }
                return gm;
            };
            transformationHandle.getSignature = function () {
                
                return _(chain).map(function (entry){
                    return [entry.name,'(',
                            _.map(entry.args, function (a){return JSON.stringify(a||null); }).join(',')
                            , ')'].join('');
                })
                .value()
                .join('.');
            };
        });
    
    function createMethod(name) {
        return function (){
            this.__chain.push({name: name, args: Array.prototype.slice.call(arguments, 0)});
            return this;
        }
    }
    var gm_methods = [].concat(supported_gm_manipulation_methods).concat(supported_gm_drawing_primitives);
    for (var i = 0; i < gm_methods.length; ++i){
        var method = gm_methods[i];
        if (excluded_gm_methods.hasOwnProperty(method)){
            continue;
        }
        Proxy.method(method, createMethod(method));
    }
    
    module.exports = Proxy.toClass();

})(module);