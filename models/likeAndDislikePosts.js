var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var likeAndDislikePostsSchema = new Schema({
    post_id: ObjectId,
    user_id: ObjectId,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
});

var LikeAndDislikePosts = mongoose.model('LikeAndDislikePosts', likeAndDislikePostsSchema, 'LikeAndDislikePosts');

module.exports = {
    LikeAndDislikePosts: LikeAndDislikePosts
}
