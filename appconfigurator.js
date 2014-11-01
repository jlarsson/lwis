(function (module){

    var express = require('express');
    var Router = express.Router;
    
    module.exports = function (app, basePath){
        return {
            createRouter: function (){
                return Router.apply(this, Array.prototype.slice.call(arguments, 0));
            },
            use: function (router){
                app.use(basePath, router);
                return this;
            },
            get: function (name){
                return app.get(name);
            },
            set: function (name, value){
                app.set(name,value);
                return this;
            }
        }
    };
})(module);