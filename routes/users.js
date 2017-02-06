var express = require('express');
var router = express.Router();

var model = require('../models/blog/model');
var User = model.User;
var Article = model.Article;

var crypto = require('crypto');
var secret = 'a12345678';

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

router.get('/management/password', function (req, res, next) {
    res.render('users/password');
});

router.get('/management/signature', function (req, res, next) {
    User.findOne({username: req.session.user.username}, function (err, user) {
        res.render('users/signature', {
            signature: user._doc.signature
        });
    });
});

router.post(/(\/change\/.*)/, function (req, res, next) {
    User.findOne({username: req.session.user.username}, function (err, user) {
        req.findUser = user;
        next();
    });
});

router.post('/change/password', function (req, res, next) {
    var md5password = crypto.createHash('md5', secret).update(req.body.oldPassword).digest('hex');
    if (req.findUser.password === md5password) {
        if (req.body.Password === req.body.cPassword) {
            md5password = crypto.createHash('md5', secret).update(req.body.Password).digest('hex');

            req.findUser.password = md5password;

            req.findUser.save(function (err, doc) {
                if (err) {
                    console.log(err);
                    return res.redirect('/users/management/password');
                }
                console.log('密码成功！');
                return res.redirect('/users');
            });
        }
        else {
            console.log("输入的2次密码不一致！");
            return res.redirect('/users/management/password');
        }
    }
    else {
        console.log("输入的密码错误！");
        return res.redirect('/users/management/password');
    }
});

router.post('/change/signature', function (req, res, next) {
    User.update({_id: req.findUser._id}, {
        signature: req.body.signature
    }, function (err, art) {
        if (err) {
            console.log(err);
            return res.redirect('/users/management/signature');
        }
        console.log(req.findUser.username + '\t个性签名\t修改成功！');
        return res.redirect('/users');
    });

});

module.exports = router;
