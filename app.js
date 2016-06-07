var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

var mongojs = require('mongojs');
var mongoose = require('mongoose');
var crate = require('mongoose-crate');
var LocalFS = require('mongoose-crate-localfs');

var pageRouter = require('./routes/pageRouter');
var account = require('./routes/account');
var badges = require('./routes/badges');
var comments = require('./routes/comments');
var postLikes = require('./routes/postLikes');
var ranking = require('./routes/ranking');
var rating = require('./routes/rating');
var submissionLikes = require('./routes/submissionLikes');
var submissions = require('./routes/submissions');

var multer = require('multer');

var pooled = require('pooled-pg');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

//local gamification database.
mongoose.connect('mongodb://localhost/gamification', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('connection to db established');
    }
});



app.use(passport.initialize());
app.use(passport.session());

//login authentication 



app.get('/', pageRouter.loginPage);
app.get('/home/:id', pageRouter.home);

app.post('/createOrFindUser', account.createOrFindUser);
app.get('/getUserPgisId/:id',account.getUserPgisId);
app.get('/getUserDetails', account.getUserDetails);

app.post('/createOrFindSubmissions', submissions.createOrFindSubmissions);

app.post('/createSubmissionPost', comments.createSubmissionPost);
app.get('/getAllSubmissionPosts', comments.getAllSubmissionPosts);

app.get('/getAllLikesAndDislikesPosts', postLikes.getAllLikesAndDislikesPosts);
app.post('/likeAndDislikePost', postLikes.likeAndDislikePost);

app.get('/getAllLikesAndDislikes', submissionLikes.getAllLikesAndDislikes);
app.post('/likeAndDislikeSubmission', submissionLikes.likeAndDislikeSubmission);

app.get('/getAllSubmissionRate/:id', rating.getAllSubmissionRate);
app.get('/getAverageSubmissionRate/:id', rating.getAverageSubmissionRate);
app.post('/rateSubmission', rating.rateSubmission);
app.get('/getAllAverageSubmissionRate', rating.getAllAverageSubmissionRate);


app.post('/createBadge', badges.createBadge);
	

app.get('/getAllUserRankings', ranking.getAllUserRankings);
app.get('/getUserRankings/:id', ranking.getUserRankings);

module.exports = app;
