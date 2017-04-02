var mongoose = require('mongoose');
var quizSchema = new mongoose.Schema({
	subject : String,
	question: [String],
	timestamp: Date,
	user_id : String,
	username : String,
	answers : [{ans : String,
		user_id : String,
		username : String,
		anstimestamp: Date
	}]
	
});

module.exports = mongoose.model('Quiz',quizSchema);
