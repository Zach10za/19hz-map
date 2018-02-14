
var passport = require('passport');
var User = require('../models/User');

exports.login = function(req, res) {
    passport.authenticate('local', function (err, User) {
        if (err) {
            return res.render('auth/login', { "error": err.message });
        }
        if (!User) {
            return res.render('auth/login', { "error": "The username or password does not match an account." });
        }
        req.login(User, function(err) {
            if (err) {
                return res.render('auth/login', { "error": err.message });
            } else {
                res.redirect('/');
            }
        });
    })(req, res);
}

exports.register = function(req, res) {
    if (req.body.password !== req.body.password_confirmation) {
        return res.render('auth/register', { "error": "The passwords do not match." });
    }
    User.register(new User({ username : req.body.username }), req.body.password, function(err, User) {
        if (err) {
            return res.render('auth/register', { "error" : err.message });
        }
        passport.authenticate('local')(req, res, function () {
          req.session.save(function(err) {
            if (err) {
                return res.render('auth/register', { "error" : err.message });
            }
            res.redirect('/');
          })  
        });
    });
}