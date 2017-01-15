var express = require('express');
var router = express.Router();

var Mealmodel = require('../models/Mealmodel');

var MealUser = Mealmodel.MealUser;
var MealOlder = Mealmodel.MealOlder;

var crypto = require('crypto');

var secret = 'a12345678';

/*用户登陆身份验证*/
router.get('/', function (req, res, next) {
    if (req.session.user.username == "root") {
        next();
    } else {
        return res.render('error', {
            message: '吃饭系统',
            error: {
                status:403,
                stack:"您没有权限呢！"
            }
        });
    }
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    return res.render('meal/index', {title: "吃饭系统"});
});

router.get('/add', function (req, res, next) {
    MealUser.find({}, function (err, doc) {
        return res.render('meal/add', {
            title: "下订单",
            lists: doc
        });
    });
});

router.post('/add', function (req, res, next) {
    var i = 0;
    var people = [];
    var jsonstep = {};
    while (true) {
        if (req.body["people[" + i + "][sum]"]) {
            jsonstep = {
                datials: req.body["people[" + i + "][datials]"],
                sum: req.body["people[" + i + "][sum]"],
                _id: req.body["people[" + i + "][_id]"],
                yue: req.body["people[" + i + "][yue]"]
            };
            people.push(jsonstep);
        } else {
            break;
        }
        i++;
    }
    var newMealOlder = new MealOlder({
        sum: req.body.sum,
        other: req.body.other,
        _sum: req.body._sum,
        people: people
    });
    var bili = parseFloat((parseFloat(newMealOlder.sum) - parseFloat(newMealOlder._sum) + parseFloat(newMealOlder.other)) / (parseFloat(newMealOlder.sum) + parseFloat(newMealOlder.other)));
    var otherPirce = (newMealOlder.other) / people.length;
    newMealOlder.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log('用户详单添加成功！');
        }
    });
    people.forEach(function (p) {
        MealUser.findOne({_id: p._id}, function (err, u) {
            MealUser.update({_id: p._id}, {
                sum: (parseFloat(u._doc.sum) - (parseFloat(p.sum) + parseFloat(otherPirce)) * bili),
                changeTime: Date.now()
            }, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('用户余额更新成功！');
                }
            });
        });
    });
    return res.json({state: 200, url: "/meal/searchOlder"});
});

router.get('/addUser', function (req, res, next) {
    return res.render('meal/addUser', {
        title: "添加新用户"
    });
});

router.post('/addUser', function (req, res, next) {
    var newMealUser = new MealUser({
        username: req.body.username,
        password: req.body.password,
        sum: req.body.sum
    });
    newMealUser.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log("新用户");
        }
        return res.redirect(".");
    });
});

router.get('/search', function (req, res, next) {
    MealUser.find({}, function (err, doc) {
        return res.render('meal/search', {
            title: "查看所有用户",
            users: doc
        });
    });
});

router.get('/searchOlder', function (req, res, next) {
    MealUser.find({}, function (err, users) {
        var peoples = [];
        users.forEach(function (user) {
            peoples[user._id] = user.username;
        });
        MealOlder.find({}, function (err, olders) {
            return res.render('meal/searchOlder', {
                title: "查看所有订单",
                olders: olders,
                peoples: peoples
            });
        });
    });
});

router.get('/mealDetails/:_id', function (req, res, next) {
    MealOlder.find({}, function (err, olders) {
        return res.render('meal/mealDetials', {
            title: "查看所有订单",
            olders: olders,
            id: req.params._id
        });
    });
});

module.exports = router;
