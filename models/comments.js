var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var CommentsSchema = new Schema({
    submission_id: Number,
    user_id: ObjectId,
    user_name: String,
    comment_string: String,
    rating: Number,
    updated: { type: Date, default: Date.now }
});

var Comments = mongoose.model('Comments', CommentsSchema, 'Comments');

module.exports = {
    Comments: Comments
}
