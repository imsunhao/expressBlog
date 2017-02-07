var express = require('express');
var router = express.Router();

var model = require('../models/blog/model');
var User = model.User;
var Article = model.Article;

var crypto = require('crypto');
var secret = 'a12345678';

/*Set routerPa ram*/
router.param('_id', function (req, res, next, id) {
    console.log('id   ' + id);
    next();
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    Article.find({author: req.session.user.username}, function (err, arts) {
        User.findOne({username: req.session.user.username}, function (err, user) {
            res.render('users/users', {
                arts: arts,
                user:user
            });
        });

    });
});

router.get('/management', function (req, res, next) {
    User.findOne({username: req.session.user.username}, function (err, user) {
        res.render('users/management', {
            user: user
        });
    });
});

router.post(/(\/management\/.*)/, function (req, res, next) {
    User.findOne({username: req.session.user.username}, function (err, user) {
        req.findUser = user;
        next();
    });
});

router.post('/management/:_name', function (req, res, next) {
    switch (req.params._name){
        case "password":
            var md5password = crypto.createHash('md5', secret).update(req.body.oldPassword).digest('hex');
            if (req.findUser.password === md5password) {
                if (req.body.Password === req.body.cPassword) {
                    md5password = crypto.createHash('md5', secret).update(req.body.Password).digest('hex');

                    req.findUser.password = md5password;

                    req.findUser.save(function (err, doc) {
                        if (err) {
                            console.log(err);
                            return res.redirect('/users');
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
                return res.redirect('/users/management');
            }
            break;
        case "portrait":
            User.update({_id: req.findUser._id}, {portrait:req.body['img']}, function (err, art) {
                if (err) {
                    console.log(err);
                    return res.redirect('/users/management');
                }
                console.log(req.findUser.username + '\t'+req.params._name+'\t修改成功！');
                return {status:1};
            });
            break;
        case "username":
        case "sex":
        case "signature":
            var update={};
            update[req.params._name]=req.body[req.params._name];
            User.update({_id: req.findUser._id}, update, function (err, art) {
                if (err) {
                    console.log(err);
                    return res.redirect('/users/management');
                }
                console.log(req.findUser.username + '\t'+req.params._name+'\t修改成功！');
                return res.redirect('/users');
            });
            break;
        default:
            return res.render('error',{
                message: 'fuck 测试..',
                error: {
                    status: 404,
                    stack: "没有漏洞！"
                }})
    }
});

module.exports = router;
