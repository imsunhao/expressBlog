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

router.get('/articleDetails/:_id', function (req, res, next) {
    Article.find({_id: req.params._id}, function (err, arts) {
        if(arts[0].public||req.session.user.username=="imsunhao"||req.session.user.username=="张瀚月"){
            return res.render('article/articleDetails',{
                title:arts[0].title,
                createTime:arts[0].createTime,
                author:arts[0].author,
                public:arts[0].public,
                sessionUser:req.session.user.username,
                content:markdown.toHTML(arts[0].content,'Maruku')
            });
        }else{
            return res.render('error',{
                message: '私人文章',
                error: {
                    status: 403,
                    stack: "您没有权限呢！"
                }})
        }
    });
});

router.post('/articleDetails/:_id',function (req,res,next) {
    Article.find({_id: req.params._id}, function (err, arts) {
        if(arts[0].public||req.session.user.username=="imsunhao"||req.session.user.username=="张瀚月"){
            Article.update({_id: req.params._id},{
                public:req.body.public
            }, function(err, art) {
                if(err) {
                    console.log(err);
                    return res.redirect('back');
                }
                console.log('文章分享！'+req.body.public);
                return res.render('error',{
                    message: '文章分享'+req.body.public,
                    error: {
                        status: 204,
                        stack: "操作成功！\n网址为：\nhttp://60.205.215.6:8088/article/articleDetails/"+req.params._id
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
    res.render('article/post', {title: 'login'});
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
        return res.redirect('back');
    })
});

module.exports = router;
