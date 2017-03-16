var mongoose = require('mongoose');
var User = require('../models/userSchema');
var Discussion = require('../models/discussionForumSchema');

var questionSchema	=	new mongoose.Schema({
	discussion_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'Discussion'},
	timeStamp		:	Date,
	user_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	fullname		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	profile_img		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	topic			:	String,
	que_body		:	String
});

module.exports	=	mongoose.model('Question',questionSchema);