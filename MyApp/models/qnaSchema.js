var mongoose = require('mongoose');
var qnaSchema = new mongoose.Schema({
	class_id:	{type: mongoose.Schema.Types.ObjectId, ref : 'Class'},
	topic : String,
	question: String,
	quetimestamp: Date,
	user_id : String,
	username : String,
	answers : [{body : String,
				user_id : String,
				username : String,
				anstimestamp: Date,
				rating	: Number}],
	
});

module.exports = mongoose.model('QnA',qnaSchema);

