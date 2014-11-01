(function (module) {
    'use strict';
    
    module.exports = function (cfg) {
        var router = cfg.createRouter();
        router.get('/', function (req, res) {
            res.render('main/index', {
                title: 'lwis'
            });
        });

        cfg.use(router);
    };
})(module);