var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Quiz = require('../models/quizSchema');



module.exports.quizShow = function(req, res){
  res.render('quiz');
};

module.exports.quizCreate = function(req,res){
	var newQue = new Quiz({
		subject: 'Subject_1',
		question : req.body.que1,
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
			Quiz.find({}).exec(function(err,entries){
				if(err){
					res.send("Error");
				}else{
					console.log(entries);
				}
				res.render('showQuiz',{entries : JSON.stringify(entries)});	
			});
		}
	});
		
};


module.exports.storeAns = function(req,res){
	console.log("---------*****"+JSON.stringify(req.body));
};