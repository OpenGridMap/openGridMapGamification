var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AccountSchema = new Schema({
    full_name: String,
    email: String,
    given_name: String,
    family_name: String,
    image_url: String,
    points: Number,
    submissions: Number,
    pgis_id: Number
});

var Account = mongoose.model('Account', AccountSchema, 'Account');

module.exports = {
    Account: Account
}
