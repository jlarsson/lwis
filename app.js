var express = require('express');
var ect = require('ect');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var expressValidator = require('express-validator');
var loader = require('./modules/loader');


var app = express();

// data folders path setup
app.set('appdata_path', path.resolve(__dirname, 'appdata'));
app.set('tmp_path', path.resolve(__dirname, 'tmp'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));

var ectRenderer = ect({
    watch: true,
    root: __dirname + '/views',
    ext: '.ect'
});
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(expressValidator());
app.use(cookieParser());

// install busboy globally for stellar multipart handling
app.use(busboy());

// Configure lwis
loader(app).configure();

app.use(express.static(path.join(__dirname, 'dist')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
