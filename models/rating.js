var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ratingSchema = new Schema({
    submission_id: Number,
    user_id: ObjectId,
    rating: { type: Number, default: 1 }
});

var Rating = mongoose.model('Rating', ratingSchema, 'Rating');

module.exports = {
    Rating: Rating
}
