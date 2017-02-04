
var qnaDb = require('./qnaDb');
var mongoose = require('mongoose');
//var QnA = require('./qnaDb').QnA;
var db = mongoose.connection;
var dbURI = 'mongodb://localhost/qnaDb1';
var QnA;
module.exports.qna = function(req, res){
		
	
		//qnaDb.qnaDbConn() ;
	
	mongoose.connect(dbURI);
	db.on('error', console.error);
	/*db.on('connected',function(){
		console.log('Mongoose connection open to ' + dbURI);
	});*/

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

	
		console.log("fetching data from mongo");
		QnA.find({}).exec(function(err,entries){
			if(err){
				res.send("Error");
			}else{
				console.log(entries);
				//res.json(entries);
			}
			res.render('qna',{entries : JSON.stringify(entries)});	
		});
		
		
				
		/*
		var testRec = new QnA({
			topic : 'general',
			question : 'How to solve a problem?',
			answers : [{body : 'By procrasting!',
						user_id : 'ABC1234',
						username : 'Meenal',
						rating	:	'4'
						},
						{body : 'By procrastinating!',
						user_id : 'ABC12345',
						username : 'MeenalK',
						rating	:	'5'
							}]
						
						
		});
		
		console.log(testRec);
		
		testRec.save(function(err){
			if(err){
				return console.log("error");
			}else{
				console.log("Saved record");
			}
			
		});
		*/
	
	
	
	
	
	
	
	
	
};

