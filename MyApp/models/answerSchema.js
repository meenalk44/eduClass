var mongoose = require('mongoose');
var Discussion = require('../models/discussionForumSchema');
var User = require('../models/userSchema');
var Question = require('../models/questionSchema');

var answerSchema	=	new mongoose.Schema({
	discussion_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'Discussion'},
	que_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'Question'},
	timeStamp		:	Date,
	user_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	fullname		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	profile_img		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	ans_body		:	String
});

module.exports	= mongoose.model('Answer',answerSchema);