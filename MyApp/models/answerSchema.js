var mongoose = require('mongoose');
var Discussion = require('../models/discussionForumSchema');
var User = require('../models/userSchema');
var Question = require('../models/questionSchema');
var autopopulate = require('mongoose-autopopulate');
//var tree = require('mongoose-tree2');
//var Reply = require('../models/replySchema');

var answerSchema	=	new mongoose.Schema({
	//_id				:	String,
	discussion_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'Discussion'},
	que_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'Question'},
	timeStamp		:	String,
	user_id			:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	fullname		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	profile_img		:	{type: mongoose.Schema.Types.String, ref : 'User'},
	ans_body		:	String,
	ans_level		:	Number,
	replies			:	[{type: mongoose.Schema.Types.ObjectId, ref : 'Answer'}]
});

//answerSchema.plugin(tree);
var deepPopulate = require('mongoose-deep-populate')(mongoose);
/*answerSchema.plugin(deepPopulate,{
    populate:{
        'replies':{
            options:{
                limit:20
            }
        }
    }
});*/
//answerSchema.plugin(autopopulate);

module.exports	= mongoose.model('Answer',answerSchema);