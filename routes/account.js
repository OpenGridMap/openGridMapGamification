var pgp = require('pg-promise')();
var account = require("../models/account").Account;
var comment = require('../models/comments').Comments;
var likeAndDislike = require('../models/likeAndDislike').LikeAndDislike;
var likeAndDislikePosts = require('../models/likeAndDislikePosts').LikeAndDislikePosts;
var rating = require("../models/rating").Rating;
var badge = require("../models/badgesEarned").BadgesEarned;


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
};


exports.getUserPgisId = function(req, res) {
    account.find({ _id: req.params.id })
        .then(function(result) {
            console.log(result);
            res.send(result[0]);
        })
};
