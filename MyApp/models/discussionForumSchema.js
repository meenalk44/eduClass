var mongoose = require('mongoose');
var Class	=	require('../models/classSchema');

var discussionForumSchema = new mongoose.Schema({
	class_id	:	{type: mongoose.Schema.Types.ObjectId, ref : 'Class'}
});

module.exports	=	mongoose.model('Discussion',discussionForumSchema);