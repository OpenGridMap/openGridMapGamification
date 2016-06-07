var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;

exports.createSubmissionPost = function(req, res) {
    var submission_id = req.body.submission_id;
    var user_id = req.body.user_id;
    var rating = req.body.rating;
    var comment_string = req.body.comment_string;

    account.find({ _id: user_id })
        .then(function(user) {
            console.log(user[0].full_name);
            new comment({
                    submission_id: submission_id,
                    user_id: user_id,
                    user_name: user[0].full_name,
                    comment_string: comment_string,
                    rating: 0
                }).save()
                .then(function(comment) {
                    res.send(comment);
                });
        });
};


exports.getAllSubmissionPosts = function(req, res) {
    var postMap = new Object();
    var submission_ids = [];
    var post_ids = [];
    var likesMap = new Object();
    var likePosts = [];

    likeAndDislikePosts.find()
        .then(function(ld) {
            likePosts = ld;
            for (l in ld) {
                post_ids.push(ld[l].post_id);
            }
        }).then(function() {
            comment.find()
                .then(function(comments) {
                    for (c in comments) {
                        submission_ids.push(comments[c].submission_id);
                    }
                    for (s in submission_ids) {
                        var posts = [];

                        // getting all information of a post
                        for (c in comments) {
                            if (submission_ids[s] == comments[c].submission_id) {
                                var lp = [];
                                for (p in post_ids) {
                                    if (post_ids[p].equals(comments[c]._id)) {
                                        lp.push(post_ids[p]);
                                    }
                                }
                                for (l in lp) {
                                    var likes = 0;
                                    var dislikes = 0;
                                    for (like in likePosts) {
                                        if (lp[l].equals(likePosts[like].post_id)) {
                                            likes = likes + likePosts[like].likes;
                                            dislikes = dislikes + likePosts[like].dislikes;
                                        }
                                    }
                                }
                                var ob = {
                                    "likes": likes,
                                    "dislikes": dislikes
                                }

                                posts.push({
                                    "comment": comments[c],
                                    "likes_dislikes": ob
                                });

                                postMap[submission_ids[s]] = posts;
                            }
                        }
                    }
                    res.send(postMap);
                });
        });
};
