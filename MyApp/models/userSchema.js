var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	google_id: String,
	token: String,
	refresh_token: String,
	username: String,
	fullname: String,
	email: String,
	role: String,
	profile_img: String
	
});

module.exports = mongoose.model('User',userSchema);
