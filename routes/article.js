var express = require('express');
var router = express.Router();

var model = require('../models/blog/model');

var User = model.User;
var Article = model.Article;

var crypto = require('crypto');

var markdown = require( "markdown" ).markdown;

var secret='a12345678';

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log("art");
});

router.get('/read/:_id', function (req, res, next) {
    Article.findOne({_id: req.params._id}, function (err, art) {
        if(art.public){
            User.findOne({username:art.author},function (err,user) {
                var portrait=user.portrait;
                if(portrait==''||typeof (portrait)=="undefined"){
                    if(user.sex)portrait='/images/user/man.jpg';
                    else portrait='/images/user/woman.jpg';
                }

                return res.render('article/read',{
                    title:art.title,
                    createTime:art.createTime,
                    author:art.author,
                    tag:art.tag,
                    public:art.public,
                    portrait:portrait,
                    signature:user.signature,
                    sessionUser:"游客",
                    content:markdown.toHTML(art.content,'Maruku')
                });
            });
        }else{
            if(req.session.user){
                if(req.session.user.username=="imsunhao"||req.session.user.username=="张瀚月"||req.session.user.username==art.author){
                    User.findOne({username:art.author},function (err,user) {
                        var portrait=user.portrait;
                        if(portrait==''||typeof (portrait)=="undefined"){
                            if(user.sex)portrait='/images/user/man.jpg';
                            else portrait='/images/user/woman.jpg';
                        }

                        return res.render('article/read',{
                            title:art.title,
                            createTime:art.createTime,
                            author:art.author,
                            tag:art.tag,
                            public:art.public,
                            portrait:portrait,
                            signature:user.signature,
                            sessionUser:req.session.user.username,
                            content:markdown.toHTML(art.content,'Maruku')
                        });
                    });
                }else{
                    return res.render('error',{
                        message: '私人文章',
                        error: {
                            status: 403,
                            stack: "您没有权限呢！"
                        }})
                }
            }else{
                return res.render('error',{
                    message: '私人文章',
                    error: {
                        status: 403,
                        stack: "您没有权限呢！"
                    }})
            }

        }
    });
});

router.post('/read/:_id',function (req,res,next) {
    Article.findOne({_id: req.params._id}, function (err, art) {
        if(art.public||req.session.user.username=="imsunhao"||req.session.user.username=="张瀚月"||art.public||req.session.user.username=="aaa"){
            Article.update({_id: req.params._id},{
                public:req.body.public
            }, function(err, art) {
                if(err) {
                    console.log(err);
                    return res.redirect('back');
                }
                console.log('文章分享！'+req.body.public);
                return res.render('error',{
                    message: '文章分享',
                    error: {
                        status: 204,
                        stack: "操作成功！\n网址为：\nhttp://60.205.215.6:8088/article/read/"+req.params._id
                    }})
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

router.get('/post', function (req, res, next) {
    res.render('article/post', {title: '发表新的文章',
        author: req.session.user.username,
        sessionUser:req.session.user.username});
});

router.post('/post', function (req, res, next) {
    var data = new Article({
        title: req.body.title,
        author: req.session.user.username,
        tag: req.body.tag,
        createTime: req.body.createTime,
        content: req.body.content
    });

    data.save(function (err, doc) {
        if (err) {
            return res.redirect('/article/post');
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
            res.render('article/search', {
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
            return res.render('article/edit', {
                _id:req.params._id,
                title:art.title,
                tag:art.tag,
                createTime:art.createTime,
                author:art.author,
                public:art.public,
                sessionUser:req.session.user.username,
                input:art.content
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
        createTime:req.body.createTime,
        content: req.body.content
    }, function(err, art) {
        if(err) {
            console.log(err);
            return res.redirect('back');
        }
        console.log('文章编辑成功！');
        return res.redirect('/article/search');
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
        return res.redirect('/');
    })
});

module.exports = router;
