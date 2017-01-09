var express = require('express');
var router = express.Router();

var model = require('../models/model');
var User = model.User;
var Article = model.Article;

var crypto = require('crypto');

var secret='a12345678';

/*Set routerPa ram*/
router.param('_name', function (req, res, next, _name) {
    console.log('userName:   ' + _name);
    next();
});
router.param('_id', function (req, res, next, id) {
    console.log('id   ' + id);
    next();
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    Article.find({author: req.session.user.username}, function (err, docs) {
        res.render('users/users', {
            art: {
                user: req.session.user.username,
                length: docs.length,
                _id: req.session.user._id
            }
        });
    });
});

router.get('/changePw', function (req, res, next) {
    res.render('users/changePw');
});

router.post('/changePw', function (req, res, next) {
    User.findOne({username: req.session.user.username}, function (err, doc) {
        var md5password=crypto.createHash('md5',secret).update(req.body.oldPassword).digest('hex');
        if (doc.password === md5password) {
            if(req.body.Password===req.body.cPassword){
                md5password=crypto.createHash('md5',secret).update(req.body.Password).digest('hex');

                doc.password=md5password;
                
                doc.save(function (err, doc) {
                    if (err) {
                        console.log(err);
                        return res.redirect('changePw');
                    }
                    console.log('密码成功！');
                    return res.redirect('.');
                });
            }
            else {
                console.log("输入的2次密码不一致！");
                return res.redirect('changePw');
            }
        }
        else {
            console.log("输入的密码错误！"+doc.password);
            return res.redirect('changePw');
        }
    });
});

module.exports = router;
