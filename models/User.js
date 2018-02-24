
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String,
    videos: [{
        thumbnail: {
            path: String,
            filename: String
        },
        path: String,
        filename: String,
        uploaded_on: Date,
        mimetype: String,
        length: Number,
        title: String,
        description: String,
        status: String,
        processing: Number
    }]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);