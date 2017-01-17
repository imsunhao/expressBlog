var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mealUserSchema = new Schema({
    username: String,
    password: String,
    sum: Number,
    createTime: {
        type: Date,
        default: Date.now
    },
    changeTime: {
        type: Date,
        default: Date.now
    }
});

exports.MealUser = mongoose.model('MealUser', mealUserSchema);


// var mealDetialSchema = new Schema({
//     username: String,
//     todo: String,
//     sum: String,
//     createTime: {
//         type: Date,
//         default: Date.now
//     }
// });
//
// exports.MealDetial = mongoose.model('MealDetial', mealDetialSchema);

var mealOlderSchema = new Schema({
    sum: Number,
    other: Number,
    _sum: Number,
    people:Array,
    createTime: {
        type: Date,
        default: Date.now
    }
});

exports.MealOlder = mongoose.model('MealOlder', mealOlderSchema);