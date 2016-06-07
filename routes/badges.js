var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;


exports.createBadge = function(req, res) {
    badge.find({
            $and: [
                { user_id: req.body.user_id },
                { badge: req.body.badge }
            ]
        })
        .then(function(result) {
            if (result.length != 0) {
                res.send('available');
            } else {
                new badge(req.body).save().then(function() {
                    res.send('newlycreated');
                })
            }
        });
};

