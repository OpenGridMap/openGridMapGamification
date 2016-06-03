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

var index = require('./routes/index');
var home = require('./routes/home')
var multer = require('multer');

var pooled = require('pooled-pg');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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



app.get('/', index.loginPage);
app.get('/home/:id', home.home);

app.post('/createOrFindUser', index.createOrFindUser);
app.post('/createOrFindSubmissions', index.createOrFindSubmissions);
app.post('/createSubmissionPost', index.createSubmissionPost);

app.get('/getUserDetails', index.getUserDetails);
app.get('/getAllSubmissionRate/:id', index.getAllSubmissionRate);
app.get('/getAverageSubmissionRate/:id', index.getAverageSubmissionRate);

app.get('/getAllSubmissionPosts', index.getAllSubmissionPosts);
app.get('/getAllAverageSubmissionRate', index.getAllAverageSubmissionRate);
app.get('/getAllLikesAndDislikes', index.getAllLikesAndDislikes);
app.get('/getAllLikesAndDislikesPosts', index.getAllLikesAndDislikesPosts);

app.post('/rateSubmission', index.rateSubmission);
app.post('/likeAndDislikeSubmission', index.likeAndDislikeSubmission);
app.post('/likeAndDislikePost', index.likeAndDislikePost);



module.exports = app;
