(function (module) {
    'use strict';

    module.exports = function (app, options) {
      require('./initrepo')(app,options);
      require('./routes')(app,options);  
    };

})(module);
