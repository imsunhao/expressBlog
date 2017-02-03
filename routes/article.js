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
                        stack: "操作成功！\n网址为：\nhttp:60.205.215.6:8088/article/articleDetails/"+req.params._id
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

module.exports = router;
