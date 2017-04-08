var mongoose = require('mongoose');
var quizSchema = new mongoose.Schema({
	class_id 	: {type: mongoose.Schema.Types.ObjectId, ref : 'Class'},
	questions	: [{
        que_num: Number,
        que_body: String
    }],
	timestamp	: String,
	user_id 	: {type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    fullname 	: {type: mongoose.Schema.Types.String, ref : 'User'},
    profile_img	: {type: mongoose.Schema.Types.String, ref : 'User'}

	
});

module.exports = mongoose.model('Quiz',quizSchema);
