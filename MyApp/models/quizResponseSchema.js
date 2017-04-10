var mongoose = require('mongoose');
var quizResponseSchema = new mongoose.Schema({
    class_id 	:   {type: mongoose.Schema.Types.ObjectId, ref : 'Class'},
    quiz_id     :   {type: mongoose.Schema.Types.ObjectId, ref : 'Quiz'},
    status      :   String,
    answers	:       [{
                        que_num: {
                            type:Number
                        },
                        ans_body:{
                            type:String
                        }
                    }],
    timestamp	:   String,
    user_id 	:   {type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    fullname 	:   {type: mongoose.Schema.Types.String, ref : 'User'},
    profile_img	:   {type: mongoose.Schema.Types.String, ref : 'User'}


});

module.exports = mongoose.model('QuizResponse',quizResponseSchema);
