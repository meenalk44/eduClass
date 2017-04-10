var mongoose = require('mongoose');
var quizSchema = new mongoose.Schema({
	class_id 	: {type: mongoose.Schema.Types.ObjectId, ref : 'Class'},
	questions	: [{
        que_num: {
            type:Number
        },
        que_body:{
            type:String
        }
    }],
    quizTakenBy :   [{type: mongoose.Schema.Types.ObjectId, ref : 'User'}],
	timestamp	: String,
	user_id 	: {type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    fullname 	: {type: mongoose.Schema.Types.String, ref : 'User'},
    profile_img	: {type: mongoose.Schema.Types.String, ref : 'User'}

	
});

module.exports = mongoose.model('Quiz',quizSchema);
