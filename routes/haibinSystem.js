var express = require('express');
var router = express.Router();


var model = require('../models/blog/model');

var Article = model.Article;

var markdown = require( "markdown" ).markdown;


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render("haibinSystem/index",{
        title:"海滨网络系统"
    });
});

router.get('/articleDetails/:_id', function (req, res, next) {
    Article.find({_id: req.params._id}, function (err, docs) {
        return res.render('article/articleDetails',{body:markdown.toHTML( docs[0]._doc.content,'Maruku')});
    });
});

router.route('/articleDetails').post(function (req, res, next) {
    var newArticle = new Article({
        title: req.body.title,
        author: req.body.author,
        tag: req.body.tag,
        content: req.body.content,
        file: req.body.file
    });
    newArticle.save(function (err,doc) { 
        assert.equal(null,err);
        console.log("发布文章成功！");
    });
});

module.exports = router;