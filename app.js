var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongoDBConfig=require('./config/mongoBDConfig.json');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var article = require('./routes/article');
var meal = require('./routes/meal');

var app = express();

var logDirectory = path.join(__dirname, 'log');

var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// logger :  https://github.com/expressjs/morgan
app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://'+mongoDBConfig.user+':'+mongoDBConfig.password+'@'+mongoDBConfig.host+':'+mongoDBConfig.port+'/'+mongoDBConfig.database+'?authSource='+mongoDBConfig.authSource, {native_parser: true});
// mongoose.connect('mongodb://localhost:18088/datas');

mongoose.connection.on('error', console.error.bind(console, '连接数据库失败'));



/*session*/
app.use(session({
    key: 'session',
    secret: 'keboard cat',
    cookie: {maxAge: 1000 * 60 * 60 * 24 },//1小时 //1k (s) * 60(min) *60 (hover) *24(day)
    store: new MongoStore({
        db: 'datas',
        mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: true
}));


/*用户登陆身份验证*/
app.use('/', function(req, res, next) {
    if(req.session.user||req.originalUrl=='/'||req.originalUrl=='/login'||req.originalUrl=='/reg'){
        next();
    }else{
        return res.render('login', {title: 'login',url:req.originalUrl});
    }
});

/*用户使用层*/
app.use('/', index);

/*用户登陆信息层*/
app.use('/users', users);

/*文章管理层*/
app.use('/article', article);

/*吃饭系统*/
app.use('/meal', meal);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
