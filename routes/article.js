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
    if(req.session.user.username=="imsunhao"||req.session.user.username=="张瀚月"){
        Article.find({_id: req.params._id}, function (err, docs) {
            return res.render('article/articleDetails',{body:markdown.toHTML( docs[0]._doc.content,'Maruku')});
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

router.post('/articleDetails/:_id', function (req, res, next) {
    console.log("修改文章")
});

module.exports = router;
