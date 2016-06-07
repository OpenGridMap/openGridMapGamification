var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;


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
        if (error) console.log(error);

        // do something with the document
    });
}

