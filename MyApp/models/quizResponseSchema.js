var mongoose = require('mongoose');
var quizResponseSchema = new mongoose.Schema({
    class_id 	:   {type: mongoose.Schema.Types.ObjectId, ref : 'Class'},
    quiz_name     :   {type: mongoose.Schema.Types.String, ref : 'Quiz'},
    quiz_id     :   {type: mongoose.Schema.Types.ObjectId, ref : 'Quiz'},
    //status      :   String,
    status: {
        type: String,
        enum : ['COMPLETED','GRADED'],
        //default: 'NOT_TAKEN'
    },
    answers	:       [{
        que_num: {
            type: Number
        },
        ans_body: {
            type: String
        }
    }],
    marks       :  [{
        que_num: {
            type:Number
        },
        marks_scored: {
            type: Number
        }
    }],
    percent_marks : Number,
    timestamp	:   String,
    user_id 	:   {type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    fullname 	:   {type: mongoose.Schema.Types.String, ref : 'User'},
    profile_img	:   {type: mongoose.Schema.Types.String, ref : 'User'},
    marks_obtd  :   Number,
    total_marks :   Number,
    user_set    : {type: mongoose.Schema.Types.String, ref : 'User'}

});

module.exports = mongoose.model('QuizResponse',quizResponseSchema);
