var mongoose = require('mongoose');
var User = require('../models/userSchema');

var classSchema = new mongoose.Schema({
	class_name	:	String,
	teacher_id	:	String,
	students	:	[{type: mongoose.Schema.Types.ObjectId, ref : 'User'}]
	
	
});

module.exports = mongoose.model('Class',classSchema);