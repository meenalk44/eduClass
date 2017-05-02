var mongoose = require('mongoose');
var User = require('../models/userSchema');
var Discussion = require('../models/discussionForumSchema');
//var tree = require('mongoose-tree2');

var questionSchema	=	new mongoose.Schema({
	discussion_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'Discussion'},
	timeStamp		:	String,
	user_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	fullname		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	profile_img		:	{type: mongoose.Schema.Types.String, ref : 'User'},
    user_set		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	topic			:	String,
	que_body		:	String,
	answers_level1	:	[{type: mongoose.Schema.Types.ObjectId, ref : 'Answer'}]
});

//questionSchema.plugin(tree);
module.exports	=	mongoose.model('Question',questionSchema);