var mongoose = require('mongoose');
var quizSchema = new mongoose.Schema({
    quiz_name   :   String,
	class_id 	: {type: mongoose.Schema.Types.ObjectId, ref : 'Class'},
	questions	: [{
                    que_num: {
                        type:Number
                    },
                    que_body:{
                        type:String
                    }
                }],
    marks       :  [{
                    que_num: {
                        type:Number
                    },
                    max_marks: {
                        type: Number
                    }
                 }],

    quizTakenBy :   [{type: mongoose.Schema.Types.ObjectId, ref : 'User'}],
	timestamp	: String,
	user_id 	: {type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    fullname 	: {type: mongoose.Schema.Types.String, ref : 'User'},
    profile_img	: {type: mongoose.Schema.Types.String, ref : 'User'},
    user_set    : {type: mongoose.Schema.Types.String, ref : 'User'}
	
});

module.exports = mongoose.model('Quiz',quizSchema);
