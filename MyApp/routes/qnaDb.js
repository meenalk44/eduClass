var mongoose = require('mongoose');
var db = mongoose.connection;
var dbURI = 'mongodb://localhost/qnaDb1';
var QnA;

module.exports.qnaDbConn = function(req,res){
	
	mongoose.connect(dbURI);
db.on('error', console.error);
db.on('connected',function(){
	console.log('Mongoose default connection open to ' + dbURI);
});

db.once('open', function(){
	var qnaSchema = new mongoose.Schema({
		topic : String,
		question: String,
		answers : [{body : String,
					user_id : String,
					username : String,
					rating	: Number}],
		
	});

	QnA = mongoose.model('QnA',qnaSchema);
});
};

module.exports = {
		QnA:QnA
};