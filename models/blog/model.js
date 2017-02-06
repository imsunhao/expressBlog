var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    signature:{
        type: String,
        default: ''
    },
    createTime: {
        type: Date,
        default: Date.now
    }
});

exports.User = mongoose.model('User', userSchema);

var articleSchema = new Schema({
    title: String,
    author: String,
    tag: String,
    content: String,
    public:{
        type: Boolean,
        default: false
    },
    createTime: {
        type: Date,
        default: Date.now
    }
});

exports.Article = mongoose.model('Article', articleSchema);
