var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var BadgesEarnedSchema = new Schema({
    user_id: ObjectId,
    badge: String,
    updated: { type: Date, default: Date.now }
});

var BadgesEarned = mongoose.model('BadgesEarned', BadgesEarnedSchema, 'BadgesEarned');

module.exports = {
    BadgesEarned: BadgesEarned
}
