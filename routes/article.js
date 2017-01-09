var express = require('express');
var router = express.Router();


var model = require('../models/model');

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
    Article.find({_id: req.params._id}, function (err, docs) {
        return res.render('article/articleDetails',function (err,html) {
            res.write(html+new Buffer(markdown.toHTML( docs[0]._doc.content,'Maruku')));
            return res.end();
        })
    });
});

router.post('/articleDetails/:_id', function (req, res, next) {
    console.log("修改文章")
});

module.exports = router;
