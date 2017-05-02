var mongoose = require('mongoose');
var User = require('../models/userSchema');
var Discussion = require('../models/discussionForumSchema');
var classSchema = new mongoose.Schema({
	class_name	:	String,
	drive_folder_id	: String,
	teacher_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	student_ids	:	[{type: mongoose.Schema.Types.ObjectId, ref : 'User'}],
	discussion_id:	{type: mongoose.Schema.Types.ObjectId, ref : 'Discussion'},
	template_A :{
			template_discussion	:	String,
			template_rating	:	{
				type: String,
				enum :	['UPVOTE', 'UPVOTE_DOWNVOTE']
			}
		},
    template_B :{
			template_discussion	:	String,
			template_rating	:	{
				type: String,
				enum :	['UPVOTE', 'UPVOTE_DOWNVOTE']
			}
    	}

});

module.exports = mongoose.model('Class',classSchema);