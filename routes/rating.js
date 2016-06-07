var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;



exports.rateSubmission = function(req, res) {
    var rating_object = req.body
    console.log(rating_object);
    new rating({
        submission_id: rating_object.submission_id,
        pgis_owner_id: rating_object.pgis_owner_id,
        user_id: rating_object.user_id,
        rating: rating_object.rating
    }).save(function(err, rating) {
        if (!err) {
            res.send('done');
        } else {
            console.log(err);
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
