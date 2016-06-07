var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;


exports.getAllUserRankings = function(req, res) {
    var response = res;
    var users = [];
    var comments = [];
    var likesPosts = [];
    var likesSubmissions = [];
    var ratings = [];
    var overAllRanking = [];
    var badges = [];
    account.find({})
        .then(function(result) {
            users = result;
        }).then(function() {
            likeAndDislike.find({})
                .then(function(result) {
                    likesSubmissions = result;
                }).then(function() {
                    comment.find({})
                        .then(function(result) {
                            comments = result;
                        }).then(function() {
                            likeAndDislikePosts.find({})
                                .then(function(result) {
                                    likesPosts = result;
                                }).then(function() {
                                    rating.find({})
                                        .then(function(result) {
                                            ratings = result;
                                        }).then(function() {
                                            badge.find()
                                                .then(function(result) {
                                                    badges = result;
                                                }).then(function() {
                                                    for (user in users) {
                                                    var count_likes = 0;
                                                    var count_likes_as_owner = 0
                                                    var count_post_likes = 0;
                                                    var count_ratings = 0;
                                                    var count_ratings_as_owner = 0;
                                                    var average_ratings_as_owner = 0;
                                                    var count_comments = 0;
                                                    var badgesEarned = [];
                                                        for (l in likesSubmissions) {
                                                            if (users[user]._id.equals(likesSubmissions[l].user_id)) {
                                                                count_likes = count_likes + 1;
                                                            }
                                                            if (users[user].pgis_id) {
                                                                if (users[user].pgis_id == likesSubmissions[l].pgis_owner_id) {
                                                                    count_likes_as_owner = count_likes_as_owner + likesSubmissions[l].likes + likesSubmissions[l].dislikes;
                                                                }
                                                            }
                                                        }
                                                        for (c in comments) {
                                                            if (users[user]._id.equals(comments[c].user_id)) {
                                                                count_comments = count_comments + 1;
                                                            }
                                                        }
                                                        for (lp in likesPosts) {
                                                            if (users[user]._id.equals(likesPosts[lp].user_id)) {
                                                                count_post_likes = count_post_likes + 1;
                                                            }
                                                        }
                                                        for (r in ratings) {
                                                            if (users[user]._id.equals(ratings[r].user_id)) {
                                                                count_ratings = count_ratings + 1;
                                                            }
                                                            if (users[user].pgis_id) {
                                                                if (users[user].pgis_id == ratings[r].pgis_owner_id) {
                                                                    average_ratings_as_owner = average_ratings_as_owner + ratings[r].rating;
                                                                    count_ratings_as_owner = count_ratings_as_owner + 1;
                                                                }
                                                            }
                                                        }

                                                        for (b in badges) {
                                                            if (users[user]._id.equals(badges[b].user_id)) {
                                                                badgesEarned.push(badges[b].badge);
                                                            }
                                                        }

                                                        var overAllRatingAverage = 0;
                                                        if (average_ratings_as_owner != 0 && count_ratings_as_owner != 0) {
                                                            overAllRatingAverage = average_ratings_as_owner / count_ratings_as_owner;
                                                        }
                                                        var totalPoints = count_likes_as_owner * 20 + overAllRatingAverage * 30 + count_post_likes * 5 + count_likes * 5 + count_ratings * 10 + count_comments * 10 + users[user].submissions * 50;
                                                        var object = {
                                                            "user": users[user],
                                                            "likesSubmissions": count_likes,
                                                            "comments": count_comments,
                                                            "likesPosts": count_post_likes,
                                                            "ratings": count_ratings,
                                                            "badgesEarned": badgesEarned,
                                                            "totalPoints": totalPoints
                                                        };

                                                        overAllRanking.push(object);
                                                        console.log(overAllRanking);
                                                    }
                                                    res.send(overAllRanking);
                                                }).catch(function(err) {
                                                    console.log(err);
                                                })
                                        });
                                });
                        });
                });
        });
};


exports.getUserRankings = function(req, res) {
    var user_id = req.params.id;
    var response = res;
    var users = [];
    var comments = [];
    var likesPosts = [];
    var likesSubmissions = [];
    var ratings = [];
    var overAllRanking = [];

    account.find({ _id: user_id })
        .then(function(result) {
            users = result;
        }).then(function() {
            likeAndDislike.find({})
                .then(function(result) {
                    likesSubmissions = result;
                }).then(function() {
                    comment.find({})
                        .then(function(result) {
                            comments = result;
                        }).then(function() {
                            likeAndDislikePosts.find({})
                                .then(function(result) {
                                    likesPosts = result;
                                }).then(function() {
                                    rating.find({})
                                        .then(function(result) {
                                            ratings = result;
                                        }).then(function() {
                                            var count_likes = 0;
                                            var count_post_likes = 0;
                                            var count_ratings = 0;
                                            var count_comments = 0;
                                            console.log()
                                            for (user in users) {
                                                for (l in likesSubmissions) {
                                                    if (users[user]._id.equals(likesSubmissions[l].user_id)) {
                                                        count_likes = count_likes + 1;
                                                    }
                                                }
                                                for (c in comments) {
                                                    if (users[user]._id.equals(comments[c].user_id)) {
                                                        count_comments = count_comments + 1;
                                                    }
                                                }
                                                for (lp in likesPosts) {
                                                    if (users[user]._id.equals(likesPosts[lp].user_id)) {
                                                        count_post_likes = count_post_likes + 1;
                                                    }
                                                }
                                                for (r in ratings) {
                                                    if (users[user]._id.equals(ratings[r].user_id)) {
                                                        count_ratings = count_ratings + 1;
                                                    }
                                                }
                                                var object = {
                                                    "user": users[user],
                                                    "likesSubmissions": count_likes,
                                                    "comments": count_comments,
                                                    "likesPosts": count_post_likes,
                                                    "ratings": count_ratings,
                                                    "totalPoints": count_post_likes * 5 + count_likes * 5 + count_ratings * 10 + count_comments * 10 + users[user].submissions * 50,
                                                };
                                                overAllRanking.push(object);
                                            }
                                            res.send(overAllRanking);
                                        });
                                });
                        });
                });
        });
};
