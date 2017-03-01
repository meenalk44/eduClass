var mongoose = require('mongoose');
var User = require('../models/userSchema');

var classSchema = new mongoose.Schema({
	class_name	:	String,
	teacher_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	student_ids	:	[{type: mongoose.Schema.Types.ObjectId, ref : 'User'}],
	qna_id		:	{type: mongoose.Schema.Types.ObjectId, ref : 'QnA'}
	
	
});

module.exports = mongoose.model('Class',classSchema);