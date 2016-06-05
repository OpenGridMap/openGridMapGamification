var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;
exports.loginPage = function(req, res) {
    res.render('index', {});
};

exports.createOrFindUser = function(req, res) {
    var user = req.body;
    var response = res;
    //remote gis database
    var remote_user = [];
    var address = 'postgresql://socialgaming:fgK7d%Q<!zmbAd2@131.159.52.86:5432/gis';
    var db = pgp(address);

    db.query('select * from "user" where email=${email}', req.body)
        .then(function(result) {
            var no_submissions = 0;
            if (result.length != 0) {
                console.log('user found : ' + result[0].id);
                var id = result[0].id;
                var no_submissions = 0;
                db.query('select * from submission where user_id =${id}', result[0])
                    .then(function(result) {
                        no_submissions = result.length;
                        console.log(no_submissions);
                        account.findOneAndUpdate({
                                query: { pgis_id: id }
                            }, {
                                update: {
                                    submissions: no_submissions,
                                    image_url: req.body.image_url
                                }
                            })
                            .then(function(user) {
                                if (!user) {
                                    var query = {
                                            email: req.body.email
                                        },
                                        update = {
                                            full_name: req.body.full_name,
                                            email: req.body.email,
                                            given_name: req.body.give_name,
                                            family_name: req.body.family_name,
                                            image_url: req.body.image,
                                            points: no_submissions * 50,
                                            submissions: no_submissions,
                                            pgis_id: id
                                        },
                                        options = { upsert: true, new: true, setDefaultsOnInsert: true };

                                    account.findOneAndUpdate(query, update, options, function(error, result) {
                                        if (error) console.log(error);
                                        res.send(result);
                                        // do something with the document
                                    });
                                } else {
                                    console.log(user);
                                    res.send(user);
                                }
                            }).catch(function(err) {
                                console.log(err);

                            });
                    }).catch(function(error) {
                        console.log(error);
                    });
            } else {

                var query = {
                        email: req.body.email
                    },
                    update = {
                        full_name: req.body.full_name,
                        email: req.body.email,
                        given_name: req.body.give_name,
                        family_name: req.body.family_name,
                        image_url: req.body.image,
                        points: no_submissions,
                        submissions: no_submissions
                    },
                    options = { upsert: true, new: true, setDefaultsOnInsert: true };

                account.findOneAndUpdate(query, update, options, function(error, result) {
                    if (error) console.log(error);
                    response.send(result);
                    // do something with the document
                });

            }
        })
        .catch(function(error) {
            console.log(error);
        });

};


exports.getUserDetails = function(req, res) {
    var email = req.body;
    account.find({ email: email })
        .then(function(user) {
            res.send(user);
        })
        .catch(function(err) {
            console.log('error found ' + err);
        });
}

exports.createOrFindSubmissions = function(req, res) {
    var submissions = req.body;
    console.log(submissions);

    res.send(submissions);
};


exports.rateSubmission = function(req, res) {
    var rating_object = req.body
    console.log(rating_object);
    new rating({
        submission_id: rating_object.submission_id,
        rating: rating_object.rating,
        user_id: rating_object.user_id
    }).save(function(err, rating) {
        if (!err) {
            res.send('done');
        } else {
            res.send(err);
        }
    });
};


exports.getAllSubmissionRate = function(req, res) {
    var user_id = req.params.id;

    rating.find({ user_id: user_id })
        .then(function(rating) {
            res.send(rating);
        })
        .catch(function(err) {
            console.log(err);
        })
};

exports.getAverageSubmissionRate = function(req, res) {
    var submission_id = req.params.id;
    rating.find({ submission_id: submission_id })

    .then(function(ratings) {
            var averageRating = 0;
            for (r in ratings) {
                averageRating = averageRating + ratings[r].rating
            }
            res.send((averageRating / rating.length))
        })
        .catch(function(err) {
            console.log(err);
        });
};

exports.getAllAverageSubmissionRate = function(req, res) {
    var rateMap = new Object();
    var submission_ids = [];

    rating.find({})
        .then(function(ratings) {
            for (r in ratings) {
                submission_ids.push(ratings[r].submission_id);
            }

            for (s in submission_ids) {
                var sr = [];
                for (r in ratings) {
                    if (submission_ids[s] == ratings[r].submission_id) {
                        sr.push(ratings[r].rating);
                    }
                }
                var average = 0;
                for (rate in sr) {
                    average = average + sr[rate];
                }
                rateMap[submission_ids[s]] = average / sr.length;
            }

            res.send(rateMap);
        });
};


exports.getSubmissionDetail = function(req, res) {
    var id = req.params.id;
    var submission_id = req.params.s_id;

    res.render('submission_detail', {});
};


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
}

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
}

exports.getAllLikesAndDislikes = function(req, res) {
    var submission_ids = [];
    var likesMap = new Object();
    likeAndDislike.find()
        .then(function(ld) {
            for (l in ld) {
                submission_ids.push(ld[l].submission_id);
            }

            for (s in submission_ids) {
                var likesAndDislikes = [];
                var likes = 0;
                var dislikes = 0;
                for (l in ld) {
                    if (submission_ids[s] == ld[l].submission_id) {
                        likesAndDislikes.push(ld[l]);
                    }
                }
                for (l in likesAndDislikes) {
                    likes = likes + likesAndDislikes[l].likes;
                    dislikes = dislikes + likesAndDislikes[l].dislikes;
                }
                var ob = {
                    "likes": likes,
                    "dislikes": dislikes
                }
                likesMap[submission_ids[s]] = ob;
            }
            res.send(likesMap);
        });
}


exports.likeAndDislikeSubmission = function(req, res) {

    var likes = req.body.likes;
    var dislikes = req.body.dislikes;
    var submission_id = req.body.submission_id;
    var user_id = req.body.user_id;

    var query = {
            $and: [
                { submission_id: submission_id },
                { user_id: user_id }
            ]
        },
        update = req.body,
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

    likeAndDislike.findOneAndUpdate(query, update, options, function(error, result) {
        if (error) return;

        // do something with the document
    });
}


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
                                                    var count_likes = 0;
                                                    var count_post_likes = 0;
                                                    var count_ratings = 0;
                                                    var count_comments = 0;
                                                    var badgesEarned = [];
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

                                                        for (b in badges) {
                                                            if (users[user]._id.equals(badges[b].user_id)) {
                                                                badgesEarned.push(badges[b].badge);
                                                            }
                                                        }

                                                        var object = {
                                                            "user": users[user],
                                                            "likesSubmissions": count_likes,
                                                            "comments": count_comments,
                                                            "likesPosts": count_post_likes,
                                                            "ratings": count_ratings,
                                                            "badgesEarned": badgesEarned,
                                                            "totalPoints": count_post_likes * 5 + count_likes * 5 + count_ratings * 10 + count_comments * 10 + users[user].submissions * 50,
                                                        };
                                                        overAllRanking.push(object);
                                                    }
                                                    res.send(overAllRanking);
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


exports.getUserPgisId = function(req, res) {
    account.find({ _id: req.params.id })
        .then(function(result) {
            console.log(result);
            res.send(result[0]);
        })
}
