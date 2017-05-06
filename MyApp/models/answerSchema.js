var mongoose = require('mongoose');
var Discussion = require('../models/discussionForumSchema');
var User = require('../models/userSchema');
var Question = require('../models/questionSchema');

var answerSchema	=	new mongoose.Schema({
	discussion_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'Discussion'},
	que_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'Question'},
	timeStamp		:	String,
	user_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	fullname		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	profile_img		:	{type: mongoose.Schema.Types.String, ref : 'User'},
    user_set		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	ans_body		:	String,
	ans_level		:	Number,
	replies			:	[{type: mongoose.Schema.Types.ObjectId, ref : 'Answer'}],
	rating			:	[{
							rating_type: {
                                type: String,
                                enum : ['UPVOTE','UPVOTE_DOWNVOTE']
                            },
							rating_by: {
								type: mongoose.Schema.Types.ObjectId,
								ref : 'User'
							}
						}],
    num_of_upvotes		: {
						type: Number,
						default : 0
						},
    num_of_downvotes	: {
						type: Number,
						default : 0
						}
});

module.exports	= mongoose.model('Answer',answerSchema);