/*****************************************************************************/
/*
 /* 完善注释 2017-02-05 12:59:24   author:imsunhao
 /*
 /*****************************************************************************/

/*****************************************************************************/
/*
 /* 启用文件系统模块
 /*     功能                       文件系统            核心
 /*
 */
var fs = require('fs');
/*
 /*****************************************************************************/


/*****************************************************************************/
/*
 /* 引入文件系统-路径模块
 /*     功能            被           所有文件系统            依赖
 /*
 */
var path = require('path');
/*
 /*****************************************************************************/


/*****************************************************************************/
/*
 /* 启用express框架
 /*     功能            核心框架
 /*     功能            引入父系统 - index
 /*     功能            引入子系统 - 其他
 /*
 */
var express = require('express');
var app = express();

var index = require('./routes/index');                                   //父系统
var users = require('./routes/users');                                   //所有系统的用户管理系统
var article = require('./routes/article');                                //博客系统
var meal = require('./routes/meal');                                    //吃饭系统
var haibinSystem = require('./routes/haibinSystem');       //海滨网路系统
/*
 /*****************************************************************************/




/*****************************************************************************/
/*
 /* 启用文件系统-读取模块
 /*     功能            被           文件系统-记录log            依赖
 /*
 */
var FileStreamRotator = require('file-stream-rotator');
/*
 /*****************************************************************************/


/*****************************************************************************/
/*
 /* 启用文件系统-记录log
 /*     功能            记录访问服务器日志
 /*     网址：     https://github.com/expressjs/morgan
 */
var logger = require('morgan');

var logDirectory = path.join(__dirname, 'log');         //日志系统路径
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
});
/*
 /*****************************************************************************/


/*****************************************************************************/
/*
 /* 启用网站功能-图标
 /*     功能            暂时未学习
 /*     网址：
 */
var favicon = require('serve-favicon');
/*
 /*****************************************************************************/

/*****************************************************************************/
/*
 /* 启用网站请求分析系统-session
 /*     功能            解析与生成    请求中    session
 /*     网址：
 */
var session = require('express-session');
/*
 /*****************************************************************************/

/*****************************************************************************/
/*
 /* 启用网站请求分析系统-cookie
 /*     功能            解析与生成    请求中    cookie
 /*     网址：
 */
var cookieParser = require('cookie-parser');
/*
 /*****************************************************************************/

/*****************************************************************************/
/*
 /* 启用网站请求分析系统-require
 /*     功能            解析    请求中     所有的参数
 /*     网址：
 */
var bodyParser = require('body-parser');
/*
 /*****************************************************************************/

/*****************************************************************************/
/*
 /* 启用网站数据存储系统-mongoose
 /*     功能            数据库     核心
 /*     网址：
 */
var mongoose = require('mongoose');


var mongoDBConfig=require('./config/mongoBDConfig.json');       //网络数据库 配置
var MongoStore = require('connect-mongo')(session);                      //提供 session  数据库依赖

mongoose.Promise = global.Promise;

/*
 /*****************************************************************************/


/*****************************************************************************/
/*
 /* 启用网站功能-访问统计
 /*     功能            统计    所有请求    的历史纪录与报表
 /*     网址（需要翻墙）：
 */
// var ua = require('universal-analytics');
// var visitor = ua('UA-91300868-1');//谷歌统计
/*
 /*****************************************************************************/


/*****************************************************************************/
/*
 /* 启用网站view engine
 /*     功能            被           所有视图系统            依赖
 /*
 */
app.set('views', path.join(__dirname, 'views'));        //模板根路径
app.set('view engine', 'ejs');                                     //模板为ejs模板
/*
 /*****************************************************************************/


/*****************************************************************************/
/*
 /* 启用 数据库-链接
 /*     功能            被           所有视图系统            依赖
 /*
 */

mongoose.connect('mongodb://'+mongoDBConfig.user+':'+mongoDBConfig.password+'@'+mongoDBConfig.host+':'+mongoDBConfig.port+'/'+mongoDBConfig.database+'?authSource='+mongoDBConfig.authSource, {native_parser: true});//网路数据库
// mongoose.connect('mongodb://localhost:18088/datas');         //本地测试数据库链接

mongoose.connection.on('error', console.error.bind(console, '连接数据库失败'));
/*
 /*****************************************************************************/



/*****************************************************************************/
/*
 /* 启用 express 中间件
 /*     功能           见注释
 /*
 */
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));   //图标
app.use(logger('combined', {stream: accessLogStream}));         //日志
app.use(bodyParser.json());                                                         //请求解析 为json格式
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());                                                                //请求解析 cookie
app.use(express.static(path.join(__dirname, 'public')));              //加载public资源
/*
 /*****************************************************************************/


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
    if(req.originalUrl.match(/\/article\/read\/.*/)||req.session.user||req.originalUrl=='/'||req.originalUrl=='/login'||req.originalUrl=='/reg'){
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

/*海滨网络系统*/
app.use('/haibinSystem', haibinSystem);

/*访问统计*/
// app.get("/test", function(req, res) {
//     visitor.pageview("/somepage", "测试页面", "https://luolei.org").send();
//     visitor.event("事件类别", "事件行为", "事件标签", 42).send();
//     res.redirect("http://this.is26.com");
// });

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

// var supertest = require('supertest');
// var should=require("should");
// var request = supertest(app);
//
//
//
// describe('Article post', function () {
//     it('Article Post sucessfully', function (done) {
//         request.post('/haibinSystem/articleDetails')
//             .send({
//                 title: "海滨网络系统内部系统的登陆界面",
//                 author: "imsunhao",
//                 tag: "公告",
//                 content: "完成海滨网络系统内部系统的登陆界面登陆功能，大家看看把账号名和密码发给我下，给你们注册下，不支持自己注册用户。功能还未完善，比如：session的使用，验证用户。登陆网址： http://imsunhao.com/haibin/index.html",
//                 file: []
//             })
//             .end(function (err, res) {
//                 should.not.exists(err);
//                 done();
//             });
//     });
// });
