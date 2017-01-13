var express = require('express');
var router = express.Router();

var Mealmodel = require('../models/Mealmodel');

var MealUser = Mealmodel.MealUser;
var MealOlder = Mealmodel.MealOlder;

var crypto = require('crypto');

var secret = 'a12345678';

/* GET users listing. */
router.get('/', function (req, res, next) {
    return res.render('meal/index',{title:"吃饭系统"});
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
        if (req.body["people[" + i + "][datials]"]) {
            jsonstep = {
                datials: req.body["people[" + i + "][datials]"],
                sum: req.body["people[" + i + "][sum]"],
                _id: req.body["people[" + i + "][_id]"]
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
    var pirce = (newMealOlder.other - newMealOlder._sum) / people.length;
    console.log(pirce);
    newMealOlder.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log('用户详单添加成功！');
        }
    });
    people.forEach(function (p) {
        MealUser.findOne({_id: p._id},function (err,u) {
            MealUser.update({_id: p._id}, {
                sum: (parseInt(u._doc.sum) - parseInt(p.sum) - parseInt(pirce)),
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
    return res.json({state: 200,url:"/meal/searchOlder"});
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
    MealUser.find({},function (err,users) {
        var peoples=[];
        users.forEach(function (user) {
            peoples[user._id]=user.username;
        });
        MealOlder.find({}, function (err, olders) {
            return res.render('meal/searchOlder', {
                title: "查看所有订单",
                olders: olders,
                peoples:peoples
            });
        });
    });
});

module.exports = router;
