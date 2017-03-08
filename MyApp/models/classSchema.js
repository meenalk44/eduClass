var mongoose = require('mongoose');
var User = require('../models/userSchema');

var classSchema = new mongoose.Schema({
	class_name	:	String,
	drive_folder_id	: String,
	teacher_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
	student_ids	:	[{type: mongoose.Schema.Types.ObjectId, ref : 'User'}],
	qna_id		:	String
	
	
});

module.exports = mongoose.model('Class',classSchema);