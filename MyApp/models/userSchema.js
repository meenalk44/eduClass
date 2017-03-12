var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	//_id	:	{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
	google_id: String,
	token: String,
	refresh_token: String,
	fullname: String,
	email: String,
	role: String,
	profile_img: String
	
});

module.exports = mongoose.model('User',userSchema);
