var mongoose = require('mongoose');
var qnaSchema = new mongoose.Schema({
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

var QnA = mongoose.model('QnA',qnaSchema);

module.exports = {
		QnA:QnA
		};
