/*
//var qnaDb = require('./qnaDb');
var mongoose = require('mongoose');
//var QnA = require('./qnaDb').QnA;
var db = mongoose.connection;
var dbURI = 'mongodb://localhost/qnaDb1';
*/
var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var QnA = require('../models/qnaSchema');
/*
module.exports.DbConn = function(req,res){
	//mongoose.connect(dbURI);
	db.on('error', console.error);
	db.on('connected',function(){
		console.log('Mongoose connection open to ' + dbURI);
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

*/

module.exports.qnaShow = function(req, res){
		console.log("fetching data from mongo");
		mongoose.model('QnA').find({}).exec(function(err,entries){
			if(err){
				res.send("Error");
			}else{
				console.log(entries);
			}
			res.render('qna',{entries : JSON.stringify(entries)});	
		});
		
		
};		

module.exports.qnaPostQ = function(req,res){
	var newQue = new QnA({
		topic: req.body.topic,
		question : req.body.que,
		quetimestamp: new Date(),
		user_id : 'userid',
		username : 'UserName',
	});
	console.log(newQue);
	newQue.save(function(err,entryQue){
		if(err){
			return console.log("Error while posting question to db");
		}else{
			console.log("Question saved to db:  "+entryQue);
			QnA.find({}).exec(function(err,entries){
				if(err){
					res.send("Error");
				}else{
					console.log(entries);
				}
				res.render('qna',{entries : JSON.stringify(entries)});	
			});
		}
	});
};	

module.exports.qnaWriteAns = function(req,res){
	console.log("---------*****"+JSON.stringify(req.body));
	console.log("---------*****"+req.body.entryID);
	console.log(JSON.stringify(req.params));
	/*QnA.findOneAndUpdate({ question: entry.question }, { username: 'starlord88' }, function(err, user) {
		  if (err) throw err;

		  // we have the updated user returned to us
		  console.log(user);
		});*/
};	

module.exports.qnaRating = function(req,res){
	
	
};	
	
	
	
	/*
	  		var testRec = new QnA({
			topic : 'general',
			question : 'Question 3......?',
			answers : [{body : 'Answer 3............',
						user_id : 'ABC1234',
						username : 'Meenal',
						rating	:	'4'
						},
						{body : 'Answer 3.2..........',
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
	

	

	
	
	
	
	
	
	
	


