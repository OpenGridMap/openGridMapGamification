var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var likeAndDislikeSchema = new Schema({
    submission_id: Number,
    user_id: ObjectId,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
});

var LikeAndDislike = mongoose.model('LikeAndDislike', likeAndDislikeSchema, 'LikeAndDislike');

module.exports = {
    LikeAndDislike: LikeAndDislike
}
