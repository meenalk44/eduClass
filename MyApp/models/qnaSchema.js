var mongoose = require('mongoose');
var qnaSchema = new mongoose.Schema({
	_id	:	{type: String, ref : 'Class'},
	class_id:String,
	class_name: String,
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

