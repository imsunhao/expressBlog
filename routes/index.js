var express = require('express');
var mongoose = require('mongoose');

//引入加密模块
var crypto = require('crypto');
var model = require('../models/blog/model');

var User = model.User;
var Article = model.Article;

var router = express.Router();

var secret='a12345678';

/*Set routerParam*/
router.param('_id', function (req, res, next, id) {
    console.log('CALLED ONLY ONCE'+id);
    next();
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: '主页',
        user: req.session.user
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'login'});
});

router.post('/login',function (req,res,next) {
    var username = req.body.email,
        password = req.body.password;
    //检查用户名是否已经存在
    //mongoose findOne() 方法
    User.findOne({username: username}, function (err, user) {
        if (err) {
            console.log(err);
            // return res.redirect('/login');
            return res.render('login', {title: 'login'});
        }
        if (user) {
            //对密码进行md5加密
            var md5password=crypto.createHash('md5',secret).update(password).digest('hex');
            if(md5password===user.password){
                console.log('登陆成功！');
                var User=user;
                User.password = null;
                delete User.password;
                req.session.user = User;
                if(req.body.url){
                    return res.redirect(req.body.url);
                }else return res.redirect('/');
            }else {
                console.log('password erro！'+md5password);
                return res.redirect('/login');
            }
        }else{
            console.log('用户名不存在！');
            return res.redirect('/login');
        }
    });
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

router.get('/reg', function (req, res, next) {
    res.render('register', {title: 'login'});
});

router.post('/reg', function (req, res, next) {
    var username = req.body.email,
        password = req.body.password;
    // passwordRepeat = req.body.passwordRepeat;

    //检查两次输入的密码是否一致
    // if (password != passwordRepeat) {
    //     console.log('两次输入的密码不一致！');
    //     return res.redirect('/reg');
    // }

    //检查用户名是否已经存在
    //mongoose findOne() 方法
    User.findOne({username: username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect('/reg');
        }
        if (user) {
            console.log('用户名已经存在');
            return res.redirect('/reg');
        }
        //对密码进行md5加密
        var md5password = crypto.createHash('md5',secret).update(password).digest('hex');
        var newUser = new User({
            username: username,
            password: md5password
        });
        //mongoose save()方法
        newUser.save(function (err, doc) {
            if (err) {
                console.log(err);
                return res.redirect('/reg');
            }
            console.log('注册成功！');
            newUser.password = null;
            delete newUser.password;
            req.session.user = newUser;
            return res.redirect('/');

        });
    });
});

router.get('/post', function (req, res, next) {
    res.render('post', {title: 'login'});
});

router.post('/post', function (req, res, next) {
    var data = new Article({
        title: req.body.title,
        author: req.session.user.username,
        tag: req.body.tag,
        content: req.body.content
    });

    data.save(function (err, doc) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/post');
        }
        console.log('文章发表成功！');
        return res.redirect('/');
    });

});

router.get('/search', function(req, res, next) {
    //req.query 获取 get 请求的参数，并构造为正则对象
    var query = req.query.title,
        title = new RegExp(query, 'i');
    Article
        .find({title: title,author:req.session.user.username})
        .sort('-createTime')
        .exec(function(err, arts) {
            if(err) {
                console.loh(err);
                return res.redirect('/');
            }
            res.render('search', {
                title: '查询结果',
                arts: arts
            });
        });
});

router.get('/edit/:_id', function(req, res, next) {
    Article.findOne({_id: req.params._id}, function(err, art) {
        if(err) {
            console.log(err);
            return res.redirect('back');
        }

        if(req.session.user.username==art.author){
            return res.render('edit', {
                title: '编辑',
                art: art
            });
        }else{
            return res.render('error',{
                message: '私人文章',
                error: {
                    status: 403,
                    stack: "您没有修改权限呢！"
                }})
        }

    });
});

router.post('/edit/:_id', function(req, res, next) {
    //mongoose 的 update() 方法用过检索参数并返回修改结果
    Article.update({_id: req.params._id},{
        title: req.body.title,
        tag: req.body.tag,
        content: req.body.content
    }, function(err, art) {
        if(err) {
            console.log(err);
            return res.redirect('back');
        }
        console.log('文章编辑成功！');
        return res.redirect('/search');
    });
});

router.get('/remove/:_id', function (req, res, next) {
    //req.params 处理 /:xxx 形式的 get 或 post 请求，获取请求参数
    Article.remove({_id: req.params._id}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('文章删除成功！');
        }
        return res.redirect('back');
    })
});

module.exports = router;
