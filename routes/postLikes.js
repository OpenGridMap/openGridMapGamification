var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;


exports.getAllLikesAndDislikesPosts = function(req, res) {
    var post_ids = [];
    var likesMap = new Object();
    likeAndDislikePosts.find()
        .then(function(ld) {
            for (l in ld) {
                post_ids.push(ld[l].post_id);
            }

            for (s in post_ids) {
                var likesAndDislikesPosts = [];
                var likes = 0;
                var dislikes = 0;
                for (l in ld) {
                    if (post_ids[s] == ld[l].post_id) {
                        likesAndDislikesPosts.push(ld[l]);
                    }
                }
                for (l in likesAndDislikesPosts) {
                    likes = likes + likesAndDislikesPosts[l].likes;
                    dislikes = dislikes + likesAndDislikesPosts[l].dislikes;
                }
                var ob = {
                    "likes": likes,
                    "dislikes": dislikes
                }
                likesMap[post_ids[s]] = ob;
            }
            res.send(likesMap);
        });
};

// liking and disliking posts sorted by user for points calculation
exports.likeAndDislikePost = function(req, res) {
    var likes = req.body.likes;
    var dislikes = req.body.dislikes;
    var post_id = req.body.post_id;
    var user_id = req.body.user_id;

    var query = {
            $and: [
                { post_id: post_id },
                { user_id: user_id }
            ]
        },
        update = req.body,
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

    likeAndDislikePosts.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;

        // do something with the document
    });
}
